import { ClientRedis } from '@nestjs/microservices';
import {
  ConflictException,
  GatewayTimeoutException,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EventEmitter } from 'events';
import { HashService } from '@tc/blockchain';
import { Logger } from 'winston';
import { PersistedTransaction } from '../../../shared/persisted-transaction';
import {
  REDIS_INJECTION,
  TRANSACTION_CREATED,
} from '@tc/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Service to share created transactions with the internal system, e.g. the network service.
 */
@Injectable()
export class ValidatorBlockchainService {
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
   * Imports required services.
   * @param hashService
   * @param logger
   * @param clientRedis
   */
  constructor(
    private readonly hashService: HashService,
    @Inject('winston') private readonly logger: Logger,
    @Inject(REDIS_INJECTION) private readonly clientRedis: ClientRedis,
  ) {}

  /**
   * Adds transaction to the pool that should be persisted. Only adds transaction to the pool if it is not yet persisted or in the pool. Return the
   * hash of the transaction when it got persisted.
   * @param transaction
   */
  async addTransaction(
    transaction: TransactionDto,
  ): Promise<PersistedTransaction> {
    // TODO improve function, see https://gitlab.com/trustcerts/trustchain/-/issues/205
    if (this.transactions.includes(transaction)) {
      throw new ConflictException('transaction already in pool');
    }
    this.transactions.push(transaction);

    this.logger.debug({
      message: `${await this.hashService.hashTransaction(
        transaction,
      )}: add transaction to pool`,
      labels: { source: this.constructor.name, type: 'transaction' },
    });
    return this.sendToNetwork(transaction);
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
  private async sendToNetwork(
    transaction: TransactionDto,
  ): Promise<PersistedTransaction> {
    const transactionHash = await this.hashService.hashTransaction(transaction);
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
      };
      const transactionSucceeded = (persisted: PersistedTransaction) => {
        cleanUp();
        resolve(persisted);
      };
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
