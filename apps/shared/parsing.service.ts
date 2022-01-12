import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { HashService } from '@tc/blockchain';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { ParsingService as Parser } from '@tc/parsing';
import { PersistedTransaction } from './persisted-transaction';
import { TRANSACTION_PARSED } from 'libs/clients/event-client/src/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Base class to parse a new transaction.
 */
export class ParsingService {
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
    protected readonly parser: Parser,
    protected readonly hashService: HashService,
    @InjectMetric('transactions')
    protected transactionsCounter: Counter<string>,
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
      this.parser.emitter.emit(`block-${transaction.block.id}`);
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
}
