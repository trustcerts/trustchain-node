import { Block } from '@tc/blockchain/block/block.interface';
import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import {
  CONSENSUS_READY_REQUEST,
  CONSENSUS_READY_RESPONSE,
  WS_BLOCK,
  WS_BLOCK_COMMIT,
  WS_BLOCK_PERSIST,
  WS_BLOCK_PROPOSE,
} from '@tc/blockchain/blockchain.events';
import { ConfigService } from '@tc/config';
import { Connection } from '@shared/connection';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { P2PService } from '@tc/p2-p';
import { ParticipantConsensus } from '../participant-consensus';
import { PersistClientService } from '@tc/clients/persist-client';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { ProposedSignatures } from '@tc/blockchain/block/proposed-signatures.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { SignatureService } from '@tc/blockchain/signature/signature.service';
import { Subject } from 'rxjs';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { ValidatorBlockchainService } from '../../validator-blockchain.service';
import { WalletClientService } from '@tc/clients/wallet-client';

/**
 * Service that handles all actions of a proposer.
 */
@Injectable()
export class ProposerService extends ParticipantConsensus {
  /**
   * Active Validator connections to interact with.
   */
  private connections!: Connection[];

  /**
   * Injects required services.
   * @param logger
   * @param validatorBlockchainService
   * @param blockCheckService
   * @param persistClientService
   * @param hashService
   * @param signatureService
   * @param walletService
   * @param p2PService
   * @param configService
   */
  constructor(
    @Inject('winston') protected readonly logger: Logger,
    protected readonly validatorBlockchainService: ValidatorBlockchainService,
    private readonly blockCheckService: BlockCheckService,
    private readonly persistClientService: PersistClientService,
    private readonly hashService: HashService,
    private readonly signatureService: SignatureService,
    private readonly walletService: WalletClientService,
    private readonly p2PService: P2PService,
    protected readonly configService: ConfigService,
  ) {
    super(logger, configService, validatorBlockchainService);
  }

  /**
   * Inits a new proposer
   * @param connections
   * @param resetEmitter
   */
  init(
    connections: Connection[],
    resetEmitter: Subject<void>,
    roundnumber: number,
  ) {
    this.roundNumber = roundnumber;
    this.connections = connections;
    this.logTime('startDelay', this.startDelay);
    const repeat = 400;
    let notReadyPrinted = false;
    // TODO repeating for long can lead to an out of sync event since other nodes will not wait for this one. has to check if value is still under this.timeoutProposeBlock.
    const syncInterval = setInterval(async () => {
      const promises = this.connections.map((connection) =>
        this.checkIfReady(connection, repeat - 100),
      );
      Promise.all(promises)
        .then(
          (results: Array<{ identifier: string; ready: boolean }>) => {
            const resetCounter = results.filter(
              (result) => result.ready,
            ).length;
            // TODO don't wait for all, single point of failure if one of the validators is not ready yet. Try to wait for all but after some time run when there are enough.
            if (
              resetCounter === results.length ||
              resetCounter / results.length >= 0.66
            ) {
              if (resetCounter === results.length) {
                this.logger.info({
                  message: `round ${this.roundNumber}: all validators are ready`,
                  labels: { source: this.constructor.name },
                });
              } else {
                this.logger.info({
                  message: `round ${this.roundNumber}: enough validators are ready`,
                  labels: { source: this.constructor.name },
                });
              }
              clearInterval(syncInterval);
              if (this.timeouts.has(`init`)) this.clearTimeout('init');
              sub.unsubscribe();
              setTimeout(() => {
                this.running = true;
                this.buildBlock().catch((err) => {
                  this.logger.error({
                    message: `round ${this.roundNumber}: ${err.message!}`,
                    labels: {
                      source: this.constructor.name,
                      process: 'consensus',
                    },
                  });
                });
              }, this.startDelay);
            } else {
              if (!notReadyPrinted) {
                this.logger.warn({
                  message: `round ${
                    this.roundNumber
                  }: some are not ready yet: ${results
                    .map((res) => res.identifier)
                    .join(', ')}`,
                  labels: {
                    source: this.constructor.name,
                    process: 'consensus',
                  },
                });
                notReadyPrinted = true;
              }
            }
          },
          (err: any) => {
            this.logger.error({
              message: `round ${this.roundNumber}: ${err.message!}`,
              labels: {
                source: this.constructor.name,
                process: 'consensus',
              },
            });
          },
        )
        .catch((err) => {
          this.logger.error(err);
        });
    }, repeat);

    this.setTimeout(
      'init',
      setTimeout(() => {
        this.logger.warn({
          message: `round ${this.roundNumber}: needed to long for a new round, cancel init`,
          labels: { source: this.constructor.name },
        });
        clearInterval(syncInterval);
        this.clearTimeout('init');
        this.newRound('init failed');
      }, 60000),
    );

    // TODO validate if this is the correct way to stop an infinitive loop
    const sub = resetEmitter.subscribe(() => {
      // TODO make sure to clear all intervals!
      this.logger.debug({
        message: `round ${this.roundNumber}: stop waiting call`,
        labels: { source: this.constructor.name },
      });
      clearInterval(syncInterval);
      if (this.timeouts.has(`init`)) this.clearTimeout('init');
      sub.unsubscribe();
    });
  }

  /**
   * Checks if the other validators have passed the latest block to receive a new one.
   * @param connection
   * @param timeout
   */
  private checkIfReady(
    connection: Connection,
    timeout: number,
  ): Promise<{ identifier: string; ready: boolean }> {
    return new Promise((resolve) => {
      const listener = (ready: boolean) => {
        if (this.timeouts.has(`checkIfReady-${connection.identifier}`))
          this.clearTimeout(`checkIfReady-${connection.identifier}`);
        connection.removeAllListeners(CONSENSUS_READY_RESPONSE, listener);
        resolve({ identifier: connection.identifier, ready: ready });
      };
      connection.socket.on(CONSENSUS_READY_RESPONSE, listener);
      connection.socket.emit(CONSENSUS_READY_REQUEST);
      this.setTimeout(
        `checkIfReady-${connection.identifier}`,
        setTimeout(() => {
          connection.removeAllListeners(CONSENSUS_READY_RESPONSE, listener);
          if (this.timeouts.has(`checkIfReady-${connection.identifier}`))
            this.clearTimeout(`checkIfReady-${connection.identifier}`);
          resolve({ identifier: connection.identifier, ready: false });
        }, timeout),
      );
    });
  }

  /**
   * Builds a new block. If there are no transaction the build process is canceled.
   */
  private async buildBlock() {
    const startTime = new Date().getTime();
    // build a valid transaction block
    const transactions = await this.buildTransactionBlock();
    if (transactions.length === 0) {
      this.logger.warn({
        message: `round ${this.roundNumber}: has not enough valid transactions to build a new block`,
        labels: { source: this.constructor.name },
      });
      this.setTimeout(
        'buildBlock',
        setTimeout(() => {
          this.clearTimeout('buildBlock');
          this.newRound('not enough transaction');
        }, this.timeoutSignatureResponse),
      );
      return;
    }
    // slice the array to provoke a call by value
    this.block = await this.generateBlock(transactions);
    this.logTime('generatingTime', new Date().getTime() - startTime);

    this.shareBlock();
  }

  /**
   * Build an array with valid transactions from the pool. The array is limited to the defined block size. The transactions are validated
   * synchronously to avoid any double entries.
   */
  private async buildTransactionBlock(): Promise<TransactionDto[]> {
    const transactions = new Map<string, TransactionDto>();
    for (const transaction of this.validatorBlockchainService.transactionPool.values()) {
      if (transactions.size === this.blockSize) {
        // break the loop if the limit is reached.
        break;
      }
      const hash = await this.hashService.hashTransaction(transaction);
      try {
        // check for double and db check since the last block could not be parsed fully.
        await this.blockCheckService.checkTransaction(
          transaction,
          transactions,
        );
        transactions.set(hash, transaction);
      } catch (e) {
        this.logger.warn({
          message: `round ${
            this.roundNumber
          }: proposer: remove transaction ${hash} because of: ${
            (e as Error).message ?? JSON.stringify(e)
          }`,
          labels: { source: this.constructor.name },
        });
        this.validatorBlockchainService.transactionPool.delete(hash);
      }
    }
    return Array.from(transactions.values());
  }

  /**
   * Generates a new Block with given transaction.
   * @param transactions
   */
  private async generateBlock(
    transactions: TransactionDto[],
  ): Promise<ProposedBlock> {
    const previousBlock = await this.persistClientService.latestBlock();
    return {
      index: previousBlock.index + 1,
      previousHash: await this.hashService.hashBlock(previousBlock),
      transactions,
      timestamp: new Date().toISOString(),
      hash: await this.hashService.hashTransactions(transactions),
      version: this.hashService.blockVersion,
    };
  }

  /**
   * Shares the proposed blocks with the validators block.
   */
  private shareBlock() {
    this.logger.debug({
      message: `round ${this.roundNumber}: proposer: start new round`,
      labels: { source: this.constructor.name },
    });

    const requestPromises = [];
    for (const validatorConnection of this.connections) {
      requestPromises.push(this.sendBlock(validatorConnection));
    }
    Promise.all(requestPromises)
      .then((responses: any[]) => {
        return responses.filter((response) => {
          if (response && response.timeout) {
            this.logger.warn({
              message: `round ${this.roundNumber}: proposer to ${response.timeout}: not all finished in time, evaluate results`,
              labels: { source: this.constructor.name },
            });
            return false;
          }
          return response !== null;
        });
      })
      .then((signatures: SignatureDto[]) => {
        return this.finishProposerRound(signatures);
      });
  }

  /**
   * Sends the block to a Validator, returns signature if proposed block was accepted. If not accepted an empty response is given.
   * @param connection
   */
  private sendBlock(connection: Connection): Promise<any> {
    const start = new Date().getTime();
    let timeout: NodeJS.Timeout;
    const wait = new Promise((resolve) => {
      timeout = setTimeout(() => {
        connection.removeAllListeners(WS_BLOCK_COMMIT);
        return resolve({ timeout: connection.identifier });
      }, this.timeoutSignatureResponse);
    });
    const response = new Promise((resolve) => {
      this.logger.debug({
        message: `round ${this.roundNumber}: proposer to ${connection.identifier}: send proposed block`,
        labels: { source: this.constructor.name },
      });
      connection.socket.emit(WS_BLOCK_PROPOSE, this.block);
      // listen for the callback
      connection.socket.on(WS_BLOCK_COMMIT, (signature: SignatureDto) => {
        connection.removeAllListeners(WS_BLOCK_COMMIT);
        this.logTime('waitingSignatures', new Date().getTime() - start);
        clearTimeout(timeout);
        this.logger.info({
          message: `round ${this.roundNumber}: proposer to ${connection.identifier}: got a signature, validate it`,
          labels: { source: this.constructor.name },
        });
        this.signatureService.validateSignature(signature, this.block).then(
          () => {
            this.logger.debug({
              message: `round ${this.roundNumber}: proposer to ${connection.identifier}: signature is valid`,
              labels: { source: this.constructor.name },
            });
            resolve(signature);
          },
          () => {
            this.logger.warn({
              message: `round ${this.roundNumber}: proposer to ${connection.identifier}: signature is not valid`,
              labels: { source: this.constructor.name },
            });
            resolve(null);
          },
        );
      });
    });
    return Promise.race([wait, response]);
  }

  /**
   * Checks if there are enough valid signatures and if so sends them to the validators, broadcasts them to the
   * gateways and persists the block.
   * @param validatorSignatures
   */
  private async finishProposerRound(validatorSignatures: SignatureDto[]) {
    if (validatorSignatures.length / this.connections.length < 0.66) {
      this.logger.warn({
        message: `round ${this.roundNumber}: proposer: not enough correct signatures`,
        labels: { source: this.constructor.name },
      });

      this.setTimeout(
        'finishProposerRound',
        setTimeout(() => {
          this.clearTimeout('finishProposerRound');
          this.newRound('not enough signatures');
          // TODO check if time is correct
        }, this.timeoutSignatureResponse),
      );
    } else {
      this.logger.debug({
        message: `round ${this.roundNumber}: proposer: got enough correct signatures`,
        labels: { source: this.constructor.name },
      });

      const signatures: ProposedSignatures = {
        proposer: await this.walletService.signIssuer(this.block),
        signatures: validatorSignatures,
      };

      this.connections.forEach((validator) => {
        this.logger.debug({
          message: `round ${this.roundNumber}: proposer ${validator.identifier}: send all signatures`,
          labels: { source: this.constructor.name },
        });
        validator.socket.emit(WS_BLOCK_PERSIST, signatures);
      });
      const persistedBlock = { ...this.block, ...signatures };
      this.broadCastToNotIncluded(persistedBlock);
      const start = new Date().getTime();
      this.validatorBlockchainService.addBlock(persistedBlock).then(() => {
        this.logTime('persistingTime', new Date().getTime() - start);
        this.logger.info({
          message: `round ${this.roundNumber}: proposer: parsed block ${persistedBlock.index} successfully.`,
          labels: { source: this.constructor.name },
        });
        this.logTime('blockIndex', persistedBlock.index);
        this.logTime(
          'blockTransactionCounter',
          persistedBlock.transactions.length,
        );
        persistedBlock.transactions.length;
        this.newRound(this.normalFinish);
      });
    }
  }

  /**
   * Shares the persisted block to all gateways since the validators of the consensus already got it.
   * @param block
   */
  private broadCastToNotIncluded(block: Block) {
    this.p2PService.connections.forEach((connection) => {
      if (
        !this.connections.find(
          (validatorConnection) =>
            validatorConnection.identifier === connection.identifier,
        )
      ) {
        this.logger.debug({
          message: `round ${this.roundNumber}: proposer to ${connection.identifier}: send persisted block`,
          labels: { source: this.constructor.name },
        });
        connection.socket.emit(WS_BLOCK, block);
      }
    });
  }
}
