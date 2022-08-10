import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { Did } from './did/schemas/did.schema';
import {
  DidId,
  DidIdDocument,
} from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidTransactionDocument } from './did/schemas/did-transaction.schema';
import { DidTransactionDto } from './did/dto/did.transaction.dto';
import { HashService } from '@tc/blockchain';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Model } from 'mongoose';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import { TRANSACTION_PARSED } from '@tc/clients/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Base class to parse a new transaction.
 */
export abstract class ParsingService<B extends DidTransactionDocument> {
  /**
   * Path where shared files should be stored that will not be stored in the database.
   */
  public static shared_storage = '/app/db_shared';

  /**
   * Inject required services.
   * @param clientRedis
   * @param parser
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly clientRedis: ClientRedis,
    protected readonly hashService: HashService,
    @InjectMetric('transactions')
    protected transactionsCounter: Counter<string>,
    protected didIdRepository: Model<DidIdDocument>,
    protected didTransactionRepository: Model<B>,
  ) {}

  /**
   * Hashes a transaction, removes the block value if it was added before.
   * @param transaction
   */
  hashTransaction(transaction: TransactionDto): Promise<string> {
    // copy so call by reference won't remove the block.
    const copy = { ...transaction };
    delete copy.block;
    return this.hashService.hashTransaction(copy);
  }

  /**
   * Emits an event for a specific transaction hashes so services that created the transaction will be informed that it got persisted.
   * @param transaction
   */
  protected async created(transaction: TransactionDto): Promise<void> {
    this.transactionsCounter.inc({
      type: transaction.body.type,
    });
    const hash = await this.hashTransaction({ ...transaction });
    if (transaction.block) {
      const persisted: PersistedTransaction = {
        transaction: {
          hash,
          persisted: new Date().toISOString(),
        },
        block: transaction.block,
      };
      this.clientRedis.emit(TRANSACTION_PARSED, persisted);
    }
  }

  /**
   * Adds the document's transaction to the database.
   */
  protected async addTransaction(
    transaction: DidTransactionDto,
  ): Promise<void> {
    const did = new this.didTransactionRepository({
      index: await this.hashService.hashTransaction(transaction),
      id: transaction.body.value.id,
      createdAt: transaction.body.date,
      values: transaction.body.value,
      signature: transaction.signature,
      type: transaction.body.type,
      didDocumentSignature: transaction.metadata.didDocSignature,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
    });
    await did.save();
  }

  /**
   * upates the did of the database by parsing the transaction. Stores the result at the end.
   */
  protected abstract parseDid(transaction: DidTransactionDto): Promise<void>;

  /**
   * Updates the core values of a did object like controllers, signature or block information.
   */
  protected async updateCoreValues(did: Did, transaction: DidTransactionDto) {
    // update the controllers
    if (transaction.body.value.controller) {
      if (transaction.body.value.controller!.remove) {
        did.controllers = did.controllers.filter((controller: DidId) =>
          transaction.body.value.controller!.remove!.includes(controller.id),
        );
      }
      if (transaction.body.value.controller!.add) {
        const newDids = await this.didIdRepository.find({
          id: { $in: transaction.body.value.controller!.add! },
        });
        if (newDids.length > 0) {
          did.controllers.push(...newDids);
        }
      }
    }
    did.signature = transaction.metadata.didDocSignature!;
    did.block = {
      ...transaction.block!,
      imported: transaction.metadata?.imported?.date,
    };
  }

  /**
   * Resets a database.
   */
  public abstract reset(): Promise<any>;
}
