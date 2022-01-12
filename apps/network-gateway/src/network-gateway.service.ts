import { ClientRedis } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { P2PService } from '@tc/p2-p';
import {
  REDIS_INJECTION,
  TRANSACTION_REJECTED,
} from 'libs/clients/event-client/src/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import {
  WS_TRANSACTION,
  WS_TRANSACTION_REJECTED,
} from '@tc/blockchain/blockchain.events';

/**
 * Shares transaction with the other validators.
 */
@Injectable()
export class NetworkGatewayService {
  /**
   * Imports required services.
   * @param p2PService
   * @param logger
   * @param clientRedis
   */
  constructor(
    private readonly p2PService: P2PService,
    @Inject('winston') private readonly logger: Logger,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
  ) {}

  /**
   * Adds transaction to the pool that should be persisted. Only adds transaction to the pool if it is not yet persisted or in the pool. Return the
   * hash of the transaction when it got persisted.
   * @param transaction
   */
  addTransaction(transaction: TransactionDto) {
    let failed = 0;
    let send = 0;
    // how many percentage of the validator pool have to reject it
    const bftValue = 0.33;
    this.p2PService.validatorConnections.forEach((connection) => {
      send++;
      // Register a rejection listener if it does not already exist
      if (connection.socket.listeners(WS_TRANSACTION_REJECTED).length == 0) {
        connection.socket.on(
          WS_TRANSACTION_REJECTED,
          (transactionHash, errorMessage) => {
            failed++;
            this.logger.warn({
              message: `transaction ${transactionHash}: Validator ${connection.identifier}, ${errorMessage}`,
              labels: {
                source: this.constructor.name,
              },
            });
            if (failed / send > bftValue) {
              this.handleRejectedTransaction(transactionHash, errorMessage);
            }
          },
        );
      }
      // fire transaction
      connection.socket.emit(WS_TRANSACTION, transaction);
    });
  }

  /**
   * Calls the rejection handler for the transaction that got rejected.
   * @param transactionHash
   * @param errorMessage
   */
  private handleRejectedTransaction(
    transactionHash: string,
    errorMessage: string,
  ): void {
    this.logger.warn(`transaction ${transactionHash}: ${errorMessage}`);
    this.clientRedis.emit(TRANSACTION_REJECTED, {
      id: transactionHash,
      error: errorMessage,
    });
  }
}
