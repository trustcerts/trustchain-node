import { ConfigService } from '@tc/config';
import { EventEmitter } from 'events';
import { Logger } from 'winston';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { ValidatorBlockchainService } from '../validator-blockchain.service';

/**
 * Base Class for the Validator and the proposer.
 */
export class ParticipantConsensus {
  /**
   * If set the consensus is building a block right now and should not be interrupted.
   */
  public running = false;

  /**
   * if set to true the Validator is ready to participate in the next round.
   */
  public ready = false;

  /**
   * Maximum size of the block
   */
  public blockSize = this.configService.getNumber('BLOCK_SIZE');
  /**
   * Emitter that is fired when the consensus finished. Other services can listen to it to execute a new round.
   */
  public changed = new EventEmitter();
  /**
   * Name of the event when a round finishes successfully.
   */
  public normalFinish = 'normal';
  /**
   * Milliseconds after a new round will be started.
   */
  protected startDelay = 1000;
  /**
   * The time the proposer waits for the signatures of the validators.
   */
  protected timeoutSignatureResponse = 3000;
  /**
   * Time period how long the Validator waits for the proposed block before canceling the round.
   */
  protected timeoutProposeBlock =
    this.startDelay + this.timeoutSignatureResponse;
  /**
   * Time period how long the Validator waits for the signatures to persist the block.
   */
  protected timeoutPersistBlock = this.timeoutSignatureResponse + 1000;
  /**
   * Proposed block that should be persisted.
   */
  protected block!: ProposedBlock;

  /**
   * Timeouts during a round to validate if one wasn't cleared.
   */
  protected timeouts = new Map<string, NodeJS.Timeout>();

  /**
   * incremented number for a new round.
   */
  protected roundNumber!: number;

  /**
   * Loads required services.
   * @param logger
   * @param logger
   * @param validatorBlockchainService
   * @param logger
   * @param validatorBlockchainService
   * @param configService
   * @param validatorBlockchainService
   */
  constructor(
    protected logger: Logger,
    protected readonly configService: ConfigService,
    protected readonly validatorBlockchainService: ValidatorBlockchainService,
  ) {}

  /**
   * Fires an event to start a new round.
   * @param reason
   */
  protected newRound(reason: string) {
    // TODO check if running will be set always to true
    if (!this.running) {
      this.logger.error({
        message: `double execution: ${reason}`,
        labels: {
          source: this.constructor.name,
          roundnumber: this.roundNumber,
        },
      });
    }
    this.running = false;
    this.updateStartDelay();
    // TODO check if all timeouts are cleared
    if (this.timeouts.size > 0) {
      this.logger.error({
        message: `timeouts not cleared ${Array.from(this.timeouts.keys()).join(
          ',',
        )}`,
        labels: {
          source: this.constructor.name,
          roundnumber: this.roundNumber,
        },
      });
    }
    this.changed.emit('round', reason);
  }

  /**
   * stores a new timeout.
   * @param key
   * @param timeout
   */
  setTimeout(key: string, timeout: NodeJS.Timeout) {
    if (this.timeouts.has(key)) {
      throw new Error(`timeout for ${key} already set`);
    }
    this.timeouts.set(key, timeout);
  }

  /**
   * clears a timeout.
   * @param key
   */
  clearTimeout(key: string) {
    const timeout = this.timeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(key);
    } else {
      throw new Error(`time out not found ${key}`);
    }
  }

  /**
   * Updates the start delay based on the amount of transactions in the pool.
   */
  private updateStartDelay() {
    if (this.validatorBlockchainService.transactionPool.size > 100) {
      this.startDelay = 0;
      this.logger.info({
        message: `correct delay time to ${this.startDelay}`,
        labels: { source: this.constructor.name },
      });
    } else if (this.startDelay === 0) {
      this.startDelay = 1000;
      this.logger.info({
        message: `correct delay time to ${this.startDelay}`,
        labels: { source: this.constructor.name },
      });
    }
  }

  /**
   * log the time depends on the value and key
   * @param key
   * @param value time
   */
  protected logTime(key: string, value: number) {
    this.logger.info({
      message: `round ${this.roundNumber}, ${key}: ${value}`,
      labels: { source: this.constructor.name, key },
    });
  }
}
