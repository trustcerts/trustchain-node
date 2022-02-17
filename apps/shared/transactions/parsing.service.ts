import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { Did } from '../did/schemas/did.schema';
import { DidId, DidIdDocument } from '@tc/did-id/schemas/did-id.schema';
import { DidTransactionDto } from '../did/dto/did.transaction.dto';
import { HashService } from '@tc/blockchain';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Model } from 'mongoose';
import { PersistedTransaction } from '../http/dto/persisted-transaction';
import { TRANSACTION_PARSED } from '@tc/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Base class to parse a new transaction.
 */
export abstract class ParsingService {
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
    // TODO set DidTransactionDocument
    protected didTransactionRepository: Model<any>,
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
    console.log('got block');
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

  protected async addDocument(transaction: DidTransactionDto): Promise<void> {
    const did = new this.didTransactionRepository({
      index: await this.hashService.hashTransaction(transaction),
      id: transaction.body.value.id,
      createdAt: transaction.body.date,
      values: transaction.body.value,
      signature: transaction.signature.values,
      didDocumentSignature: transaction.metadata.didDocSignature,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
    });
    await did.save();
  }

  protected abstract parseDid(transaction: DidTransactionDto): Promise<void>;

  protected async updateController(did: Did, transaction: DidTransactionDto) {
    console.log(transaction);
    // update the controllers
    if (transaction.body.value.controller) {
      if (transaction.body.value.controller!.remove) {
        did.controllers = did.controllers.filter((controller: DidId) =>
          transaction.body.value.controller!.remove!.includes(controller.id),
        );
      }
      console.log(transaction.body.value.id);
      if (transaction.body.value.controller!.add) {
        console.log('got controllers');
        console.log(transaction.body.value.controller!.add);
        const newDids = await this.didIdRepository.find({
          id: { $in: transaction.body.value.controller!.add! },
        });
        console.log(newDids);
        if (newDids.length > 0) {
          did.controllers.push(...newDids);
        }
        console.log(did.controllers);
      }
    }
  }

  /**
   * Resets a database.
   */
  public abstract reset(): Promise<void>;
}
