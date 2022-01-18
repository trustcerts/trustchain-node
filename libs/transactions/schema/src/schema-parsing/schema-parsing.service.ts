import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@shared/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { Schema, SchemaDocument } from '../schemas/schema.schema';
import { SchemaTransaction } from '../dto/schema.transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses new schema transactions.
 */
@Injectable()
export class SchemaParsingService extends ParsingService {
  /**
   * Creates a HashBlockchainService and places listeners for hashes on the blockchainService.
   * @param parser
   * @param clientRedis
   * @param schemaModel
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Schema.name)
    private schemaModel: Model<SchemaDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(clientRedis, hashService, transactionsCounter);

    this.parseService.parsers.set(TransactionType.Schema, {
      parsing: this.add.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  private async add(transaction: SchemaTransaction) {
    // TODO how to handle updates
    const schema = new this.schemaModel({
      id: transaction.body.value.id,
      schema: transaction.body.value.schema,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
      signature: transaction.signature.values,
    });
    await schema.save().catch((err: any) =>
      this.logger.error({
        message: err,
        labels: { source: this.constructor.name },
      }),
    );
    this.created(transaction);
  }

  /**
   * Resets the database
   */
  public async reset(): Promise<void> {
    await this.schemaModel.deleteMany();
  }
}
