import {
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HashService } from '@tc/blockchain/hash.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

import { ClientRedis } from '@nestjs/microservices';
import { DidIdCachedService } from '@tc/did-id/cached/did-id-cached.service';
import { EventEmitter } from 'events';
import { Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Logger } from 'winston';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import {
  REDIS_INJECTION,
  TRANSACTION_CREATED,
} from '@tc/event-client/constants';

/**
 * Service that is used to send transactions to the validators and responds to the Client.
 */
@Injectable()
export class GatewayBlockchainService {
  /**
   * Pool of transactions that will be persisted.
   */
  private transactions: TransactionDto[] = [];

  /**
   * Event emitter for parsed transactions.
   * @private
   */
  private persistedEvent = new EventEmitter();
  /**
   * Event emitter for failed transactions.
   * @private
   */
  private failedEvent = new EventEmitter();

  /**
   * Prom metric to expose the current length of transactions in transaction pool.
   * @private
   */

  /**
   * Imports required services.
   * @param hashService
   * @param didCachedService
   * @param logger
   * @param clientRedis
   */
  constructor(
    private readonly hashService: HashService,
    private readonly didCachedService: DidIdCachedService,
    @Inject('winston') private readonly logger: Logger,
    @Inject(REDIS_INJECTION) private readonly clientRedis: ClientRedis,
    @InjectMetric('gateway_transactionPool')
    private promTPLength: Gauge<string>,
  ) {}

  /**
   * Adds transaction to the pool that should be persisted. Only adds transaction to the pool if it is not yet persisted or in the pool. Return the
   * hash of the transaction when it got persisted.
   * @param transaction
   * @param type
   */
  async addTransaction(
    transaction: TransactionDto,
    type?: 'own',
  ): Promise<PersistedTransaction> {
    // TODO improve function
    if (this.transactions.includes(transaction)) {
      throw new ConflictException('transaction already in pool');
    }

    // only ask this when the Client deals with vcs
    if (type !== 'own') {
      await this.didCachedService.canIssuerAssign(transaction).catch(() => {
        throw new ForbiddenException('Client uses invalid certificate');
      });
    }
    this.transactions.push(transaction);
    setTimeout(() => this.promTPLength.inc(1), 1000);
    this.logger.debug({
      message: `${await this.hashService.hashTransaction(
        transaction,
      )}: add transaction to pool`,
      labels: { source: this.constructor.name, type: 'transaction' },
    });
    return this.sendToValidators(transaction);
  }

  /**
   * Fires an persisted event with the transaction's hash.
   * @param persisted
   */
  persisted(persisted: PersistedTransaction): void {
    this.persistedEvent.emit(persisted.transaction.hash, persisted);
  }

  /**
   * Fires an rejection event with the transaction's hash.
   * @param transactionHash
   * @param error
   */
  rejected(transactionHash: string, error: HttpException): void {
    this.failedEvent.emit(transactionHash, error);
  }

  /**
   * Sends transactions to all validators. Register event to wait for a response to return a promise
   * @param transaction
   */
  private async sendToValidators(
    transaction: TransactionDto,
  ): Promise<PersistedTransaction> {
    const transactionHash = await this.hashService.hashTransaction(transaction);
    // TODO share this logic with the Validator
    // TODO instead of just returning void, more information about the persistence can be returned, e.g. block id, timestamp, etc.
    return new Promise((resolve, reject) => {
      const cleanUp = () => {
        clearTimeout(timeOut);
        this.persistedEvent.removeListener(
          transactionHash,
          transactionSucceeded,
        );
        this.failedEvent.removeListener(transactionHash, transactionFailed);
        this.transactions = this.transactions.filter(
          (transactionPool) => transactionPool !== transaction,
        );
        setTimeout(() => this.promTPLength.dec(1), 2000);
      };
      const transactionSucceeded = (transaction: PersistedTransaction) => {
        cleanUp();
        resolve(transaction);
      };
      // TODO if only one node disagrees this function is triggered! Needs a logical fix to reduce single point of failure
      const transactionFailed = (error: Error) => {
        cleanUp();
        reject(error);
      };

      // TODO use only one handler
      this.persistedEvent.once(transactionHash, transactionSucceeded);
      this.failedEvent.once(transactionHash, transactionFailed);

      const timeoutTime = 20;
      const timeOut = setTimeout(
        () =>
          transactionFailed(
            new GatewayTimeoutException(
              `transaction could not be proceed during the last ${timeoutTime} seconds.`,
            ),
          ),
        timeoutTime * 1000,
      );
      // TODO switch to TCP if the node should inform the Client that the node has problems with the network
      this.clientRedis.emit(TRANSACTION_CREATED, transaction);
    });
  }
}
