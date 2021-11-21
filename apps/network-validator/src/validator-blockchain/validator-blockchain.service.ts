import { Block } from '@tc/blockchain/block/block.interface';
import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import {
  CONNECTION_ADDED,
  CONNECTION_VALIDATORS_RESPONSE,
  LIST_NOT_EMPTY,
  WS_TRANSACTION,
  WS_TRANSACTION_REJECTED,
} from '@tc/blockchain/blockchain.events';
import { ClientRedis } from '@nestjs/microservices';
import { Socket as ClientSocket } from 'socket.io-client';
import { Connection } from '../../../shared/connection';
import { EventEmitter } from 'events';
import { HashService } from '@tc/blockchain/hash.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { NetworkService } from '@tc/network';
import { P2PService } from '@tc/p2-p';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { RoleManageAddEnum } from '@tc/did/constants';
import { Socket as ServerSocket } from 'socket.io';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * A ValidatorBlockchainService has Validator specific blockchain features.
 */
@Injectable()
export class ValidatorBlockchainService {
  /**
   * emitter that will deal with transaction events
   */
  public transactionEvent = new EventEmitter();
  /**
   * pool of transactions that should be included in the next block
   */
  public transactionPool: Map<string, TransactionDto> = new Map();
  /**
   * a flag to send transactions
   */
  private sendTransaction = true;

  /**
   * Constructor to add a ValidatorBlockchainService.
   * @param p2PService
   * @param hashService
   * @param blockCheckService
   * @param networkService
   * @param clientRedis
   * @param logger
   */
  constructor(
    private readonly p2PService: P2PService,
    private readonly hashService: HashService,
    private readonly blockCheckService: BlockCheckService,
    private readonly networkService: NetworkService,
    @Inject(REDIS_INJECTION) private readonly clientRedis: ClientRedis,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.p2PService.connectionChanges.on(
      CONNECTION_ADDED,
      this.connectionAdded.bind(this),
    );
  }

  /**
   * Informs the gateways about existing and connected validators.
   * @param peer Validator that is informed about
   */
  informGateways(peer: string): void {
    this.p2PService.connections.forEach((connection) => {
      if (!connection.peer) {
        connection.socket.emit(CONNECTION_VALIDATORS_RESPONSE, [peer]);
      }
    });
  }

  /**
   * Broadcasts transaction to all nodes an add it to the own pool.
   * @param transaction
   */
  public async broadCastTransaction(
    transaction: TransactionDto,
  ): Promise<void> {
    await this.addTransaction(transaction);
    this.p2PService.validatorConnections.forEach((connection) => {
      connection.socket.emit(WS_TRANSACTION, transaction);
    });
  }

  /**
   * Adds a block the the blockchain and filters out the persisted transactions from the pool.
   * @param block
   */
  public async addBlock(block: Block): Promise<void> {
    await this.filterPool(block);
    await this.networkService.addBlock(block);
  }

  /**
   * Add transaction to own pool and emit event that there are new transactions. Before adding it, the transaction will be validated. Throws the error
   * in a callback.
   * @param transaction transaction to be added
   * @param socket
   */
  async addTransaction(
    transaction: TransactionDto,
    socket: ServerSocket | ClientSocket | null = null,
  ): Promise<void> {
    const transactionHash = await this.hashService.hashTransaction(transaction);
    this.blockCheckService
      .checkTransaction(transaction, this.transactionPool)
      .then(
        () => {
          this.transactionPool.set(transactionHash, transaction);
          if (this.sendTransaction) {
            this.transactionEvent.emit(LIST_NOT_EMPTY);
          }
          this.sendTransaction = false;
        },

        (err: Error) => {
          if (this.transactionPool.size === 0) this.sendTransaction = true;
          this.logger.warn({
            message: `${transactionHash}: ${err.message}`,
            labels: { source: this.constructor.name },
          });
          if (socket) {
            socket.emit(WS_TRANSACTION_REJECTED, transactionHash, err.message);
          }
        },
      );
  }

  /**
   * Event that is fired when a new node connected to this node. Listens to events based on the rights of the node.
   * @param connection
   */
  private connectionAdded(connection: Connection) {
    // is connection from a Validator. If yes, inform gateways
    if (connection.peer) {
      this.informGateways(connection.peer);
    }
    this.logger.debug({
      message: 'add listeners',
      labels: { source: this.constructor.name },
    });
    const allowedToWrite: RoleManageAddEnum[] = [
      RoleManageAddEnum.Validator,
      RoleManageAddEnum.Gateway,
    ];
    if (allowedToWrite.includes(connection.type)) {
      this.logger.debug({
        message: `${connection.identifier} is allowed to write`,
        labels: { source: this.constructor.name },
      });
      connection.socket.on(WS_TRANSACTION, (values) =>
        this.addTransaction(values, connection.socket),
      );
    } else {
      this.logger.info({
        message: `${connection.identifier} is not allowed to write`,
        labels: { source: this.constructor.name },
      });
    }
  }

  /**
   * removes all transactions that were included in the last persisted block. Compare hashes since direct object
   * comparison does not work.
   * @param block
   */
  private async filterPool(block: Block) {
    const previous = this.transactionPool.size;
    for (const transaction of block.transactions) {
      const transactionHash = await this.hashService.hashTransaction(
        transaction,
      );
      this.transactionPool.delete(transactionHash);
    }
    if (this.transactionPool.size === 0) this.sendTransaction = true;
    this.logger.debug({
      message: `reduce pool size from ${previous} to ${this.transactionPool.size} values`,
      labels: { source: this.constructor.name },
    });
  }
}
