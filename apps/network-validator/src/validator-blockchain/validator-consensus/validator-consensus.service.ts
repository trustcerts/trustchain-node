import {
  CONNECTION_ADDED,
  CONNECTION_REMOVED,
  CONSENSUS_RESET,
  LIST_NOT_EMPTY,
  REQUEST_ROUND_NUMBER,
  RESPONSE_ROUND_NUMBER,
} from '@tc/blockchain/blockchain.events';
import { ConfigService } from '@tc/config/config.service';
import { Connection } from '@shared/connection';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { P2PService } from '@tc/p2-p';
import { ProposerService } from './proposer/proposer.service';
import { Subject } from 'rxjs';
import { ValidatorBlockchainService } from '../validator-blockchain.service';
import { ValidatorService } from './validator/validator.service';
import Timeout = NodeJS.Timeout;
import { Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

/**
 * Service that is responsible for the consensus to find valid blocks.
 */
@Injectable()
export class ValidatorConsensusService {
  /**
   * amount of rounds a node was part of.
   */
  public roundNumber: number;

  /**
   * Set to true so consensus does not run twice. Network is mashed so the consensus can run without any problem.
   */
  public ready = false;

  /**
   * Identifier of the current proposer.
   */
  public proposer!: string;

  /**
   * Counts the rounds that misses one after another.
   */
  private failedRuns = 0;

  /**
   * Maximum after the consensus is reset.
   */
  private failedMaxRuns = 5;

  /**
   * Will be emitted when the service should be reset.
   * @private
   */
  private resetEmitter = new Subject<void>();

  /**
   * Timeout of the sequence.
   */
  initSequence?: Timeout;

  /**
   * Numbers of seconds how long Validator will wait until it will start the
   * consensus after the last connected Validator.
   */
  initWaitingSequence: number;

  /**
   * Injects required services and adds a listener that will be triggered, when a connection is added to start the consensus.
   * @param validatorBlockchainService
   * @param p2PService
   * @param configService
   * @param logger
   * @param validatorService
   * @param proposerService
   * @param didCachedService
   * @param promService
   */
  constructor(
    private readonly validatorBlockchainService: ValidatorBlockchainService,
    private readonly p2PService: P2PService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    private readonly validatorService: ValidatorService,
    private readonly proposerService: ProposerService,
    private readonly didCachedService: DidIdCachedService,
    @InjectMetric('validator_min') private promValidatorMin: Gauge<string>,
    @InjectMetric('validator_max') private promValidatorMax: Gauge<string>,
  ) {
    this.initWaitingSequence = configService.getNumber('CONSENSUS_WAIT_INIT');
    this.roundNumber = 0;
    this.registerListeners();
    this.promValidatorMin.set(configService.getNumber('VALIDATOR_MIN'));
  }

  /**
   * Rests the consensus.
   */
  public resetService() {
    this.ready = false;
    this.roundNumber = 0;
    if (this.initSequence) {
      clearTimeout(this.initSequence);
    }
    // TODO remove all events that are set because of other connections.
    this.validatorService.changed.removeAllListeners();
    this.resetEmitter.next();
  }

  /**
   * Returns true if the node is the current selected proposer
   */
  public isProposer(): boolean {
    return this.proposer === this.configService.getConfig('IDENTIFIER');
  }

  /**
   * Listener when a new connection is added to the system. Registers endpoint for requests.
   */
  private registerListeners() {
    this.p2PService.connectionChanges.on(
      CONNECTION_ADDED,
      (connection: Connection) => {
        if (connection.type === 'validator') {
          this.logger.debug({
            message: `round ${this.roundNumber}: register for ${connection.identifier}`,
            labels: { source: this.constructor.name },
          });
          // return round instead of proposer
          connection.socket.on(REQUEST_ROUND_NUMBER, () => {
            // in a running
            if (this.validatorService.running && this.proposerService.running) {
              this.logger.debug({
                message: `round ${this.roundNumber}: send ${
                  this.roundNumber + 1
                } to ${connection.identifier}`,
                labels: { source: this.constructor.name },
              });
              connection.socket.emit(
                RESPONSE_ROUND_NUMBER,
                this.roundNumber + 1,
              );
            } else {
              this.logger.debug({
                message: `round ${this.roundNumber}: send ${this.roundNumber} to ${connection.identifier}`,
                labels: { source: this.constructor.name },
              });
              connection.socket.emit(RESPONSE_ROUND_NUMBER, this.roundNumber);
            }
          });

          connection.socket.on(CONSENSUS_RESET, (value, callback) => {
            callback(this.roundNumber === 0);
          });
          this.validatorAdded().then();
        }
      },
    );

    this.p2PService.connectionChanges.on(
      CONNECTION_REMOVED,
      (connection: Connection) => {
        if (connection.type === 'validator') {
          // TODO remove the function listeners from above to prevent a memory leak
          this.validatorRemoved();
        }
      },
    );
  }

  /**
   * Checks if Validator has enough connections to run consensus. Adds endpoint to send current proposer if one is already set.
   */
  private async validatorAdded() {
    const validatorMax = await this.didCachedService.getValidatorMax();
    this.promValidatorMax.set(validatorMax);
    if (
      validatorMax - 1 === this.p2PService.validatorConnections.length &&
      !this.ready
    ) {
      this.ready = true;
      // all connected
      this.logger.info({
        message: `round ${this.roundNumber}: connected with all possible validators`,
        labels: { source: this.constructor.name },
      });
      this.startConsensus().then();
    } else if (this.hasEnoughValidators() && !this.ready) {
      // 3 min, 5 max
      this.startWaitSequence();
    }
  }

  /**
   * Starts the waiting sequence. It will be reset if the function is called by another validatorAdded event. When the timeout passed the consensus
   * will be started.
   * @private
   */
  private startWaitSequence() {
    if (this.initSequence) {
      clearTimeout(this.initSequence);
      this.logger.debug({
        message: `round ${this.roundNumber}: reset sequence because of a new connection.`,
        labels: { source: this.constructor.name },
      });
    } else {
      this.logger.debug({
        message: `round ${this.roundNumber}: minimum amount reached, start minimum sequence.`,
        labels: { source: this.constructor.name },
      });
    }
    this.initSequence = setTimeout(() => {
      this.ready = true;
      this.logger.debug({
        message: `round ${this.roundNumber}: waiting time passed.`,
        labels: { source: this.constructor.name },
      });
      this.startConsensus().then();
    }, this.initWaitingSequence * 1000);
    this.logger.debug({
      message: `round ${this.roundNumber}: start sequence with ${this.initWaitingSequence} seconds.`,
      labels: { source: this.constructor.name },
    });
  }

  /**
   * Starts the consensus round by initializing the first round. Clears potential timeouts from other async calls.
   * @private
   */
  private async startConsensus() {
    if (this.initSequence) {
      clearTimeout(this.initSequence);
    }
    // get the round numbers of all connected validators.
    await this.setRoundNumber();
    this.newRound('init');
  }

  /**
   * Checks if there are still enough validators to perform the consensus.
   */
  private validatorRemoved() {
    if (!this.hasEnoughValidators()) {
      if (this.ready) {
        this.ready = false;
        this.logger.error({
          message: `round ${this.roundNumber}: has not enough validators to continue consensus`,
          labels: { source: this.constructor.name },
        });
        this.resetEmitter.next();
      } else {
        if (this.initSequence) {
          clearTimeout(this.initSequence);
          this.logger.info({
            message: `round ${this.roundNumber}: cancel init sequence, not enough connections.`,
            labels: { source: this.constructor.name },
          });
        }
      }
    }
  }

  /**
   * Checks if there are at least as many validators connected as configured.
   */
  private hasEnoughValidators(): boolean {
    // reduce one since node does not connect with itself.
    return (
      this.p2PService.validatorConnections.length >=
      this.configService.getNumber('VALIDATOR_MIN') - 1
    );
  }

  /**
   * Starts a new round, listens to the transaction pool if it gets filled.
   * @param action reason why the new round started.
   */
  private newRound(action: string) {
    if (action === this.validatorService.normalFinish || action === 'init') {
      this.failedRuns = 0;
    } else {
      this.failedRuns++;
      if (this.failedRuns >= this.failedMaxRuns) {
        this.logger.error({
          message: `round ${this.roundNumber}: Failed ${this.failedRuns} to make a new round, reset consensus`,
          labels: { source: this.constructor.name },
        });
        this.reset();
        return;
      }
    }

    this.logger.debug({
      message: `round ${this.roundNumber}: begin new round because of: ${action}`,
      labels: { source: this.constructor.name },
    });
    this.startRound().then();
  }

  /**
   * Resets the consensus because validators failed to generate a block in the last rounds.
   */
  private reset() {
    process.exit(1);
    return;
    this.proposer = this.configService.getConfig('IDENTIFIER');
    this.roundNumber = 0;
    this.failedRuns = 0;
    const resetInterval = setInterval(() => {
      const promises = this.p2PService.validatorConnections.map((connection) =>
        this.checkIfHealthy(connection),
      );
      Promise.all(promises).then(
        (results: Array<{ identifier: string; reset: boolean }> | any[]) => {
          const resetCounter = results.filter((result) => result.reset).length;
          if (results.length > 0 && resetCounter === results.length) {
            this.logger.info({
              message: `round ${this.roundNumber}: all ${results.length} validators agreed to reset consensus`,
              labels: { source: this.constructor.name },
            });
            clearInterval(resetInterval);
            setTimeout(async () => {
              await this.startRound();
            }, 2000);
          }
        },
      );
    }, 500);
  }

  /**
   * Asks another Validator if it has a set proposer to know if it is resetting to.
   * @param connection
   */
  private checkIfHealthy(connection: Connection) {
    return new Promise((resolve) => {
      connection.socket.emit(CONSENSUS_RESET, null, (reset: boolean) => {
        resolve({ identifier: connection.identifier, reset });
      });
    });
  }

  /**
   * Starts a new round, depending on being a proposer or not the node listens to different actions.
   */
  private async startRound() {
    await this.setProposer();
    this.logger.info({
      message: `round ${this.roundNumber}: ${this.proposer}: is new proposer!`,
      labels: {
        source: this.constructor.name,
      },
    });
    if (this.isProposer()) {
      if (this.validatorBlockchainService.transactionPool.size === 0) {
        this.validatorBlockchainService.transactionEvent.on(
          LIST_NOT_EMPTY,
          () => {
            this.runProposer();
            this.validatorBlockchainService.transactionEvent.removeAllListeners(
              LIST_NOT_EMPTY,
            );
          },
        );
      } else {
        this.runProposer();
      }
    } else {
      this.runValidator();
    }
  }

  /**
   * Requests the round numbers from all validators and sets the highest value to the own value.
   * @private
   */
  private async setRoundNumber() {
    // collect all round numbers
    const results = await Promise.all(
      this.p2PService.validatorConnections.map((connection) =>
        this.requestRoundNumber(connection),
      ),
    );
    // get the highest one.
    const roundResult = Math.max(...results, this.roundNumber);
    this.logger.info({
      message: `round ${this.roundNumber}: highest value ${roundResult}`,
      labels: { source: this.constructor.name },
    });
    this.roundNumber = roundResult;
  }

  /**
   * Sets the proposer based on the set round number.
   * @private
   */
  private async setProposer() {
    // TODO compare propsers with connections so no offline validators are used for waiting procedure. If it uses only the connected validators, the list in the network can be different since full mashing is not guaranteed.
    // TOOD improve algorithm to select the correct proposer. Algorithm has to work in the decentralised network.
    const proposers = await this.didCachedService.getValidatorIdentifiers();
    const index = this.roundNumber % proposers.length;
    this.proposer = proposers[index];
  }

  /**
   * Asks a Validator for its round number. If it does not response, it tries again.
   * @param connection
   * @private
   */
  private requestRoundNumber(connection: Connection): Promise<number> {
    return new Promise((resolve) => {
      this.logger.info({
        message: `round ${this.roundNumber}: ${connection.identifier}: request proposer`,
        labels: { source: this.constructor.name },
      });
      connection.socket.on(RESPONSE_ROUND_NUMBER, (proposer: number) => {
        clearInterval(interval);
        this.logger.info({
          message: `round ${this.roundNumber}: ${connection.identifier}: got round number ${proposer}`,
          labels: { source: this.constructor.name },
        });
        connection.removeAllListeners(RESPONSE_ROUND_NUMBER);
        resolve(proposer);
      });
      // TODO deadlock if other party does not answer.
      // use an interval to call again, maybe the other node hasn't registered the event yet.
      const interval = setInterval(() => {
        connection.socket.emit(REQUEST_ROUND_NUMBER, null);
      }, 500);
    });
  }

  /**
   * Register relevant events. Proposes a new block and waits for enough valid signatures. If it collected enough, the proposer will sign the block
   * and share the signatures with the other validators to persist the block. A new round will be triggered if an error occurred or the round finished
   * successfully.
   */
  private runProposer() {
    this.proposerService.init(
      this.p2PService.validatorConnections,
      this.resetEmitter,
      this.roundNumber,
    );
    this.proposerService.changed.removeAllListeners('round');
    this.proposerService.changed.on('round', (reason) => {
      if (this.hasEnoughValidators()) {
        this.roundNumber++;
        this.newRound(reason);
        this.proposerService.changed.removeAllListeners('round');
      }
    });
  }

  /**
   * Adds the listener if the node is a Validator and not a proposer. It waits for a proposed block and validates it. If the block is true, the
   * response will be a signature of the block. When a block with enough valid signatures arrives, the block will be persisted.
   */
  private runValidator() {
    const proposer = this.p2PService.connections.find(
      (connection) => connection.identifier === this.proposer,
    );
    if (!proposer) {
      this.logger.warn({
        message: `round ${this.roundNumber}: no connection found for proposer`,
        labels: { source: this.constructor.name },
      });
      this.roundNumber++;
      this.newRound('selected proposer not connected');
      return;
    }

    this.validatorService.init(proposer, this.roundNumber);
    this.validatorService.changed.removeAllListeners('round');
    this.validatorService.changed.on('round', (reason) => {
      if (this.hasEnoughValidators()) {
        this.roundNumber++;
        this.newRound(reason);
        this.validatorService.changed.removeAllListeners('round');
      }
    });
  }
}
