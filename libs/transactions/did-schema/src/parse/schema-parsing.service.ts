import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DidId } from '@trustcerts/core';
import { DidIdDocument } from '@tc/did-id/schemas/did-id.schema';
import { DidSchema, SchemaDocument } from '../schemas/did-schema.schema';
import {
  DidSchemaTransaction,
  SchemaTransactionDocument,
} from '../schemas/did-schema-transaction.schema';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@shared/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { SchemaTransactionDto } from '../dto/schema.transaction.dto';
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
   * @param didSchemaRepository
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidSchema.name)
    private didSchemaRepository: Model<SchemaDocument>,
    @InjectModel(DidSchemaTransaction.name)
    didSchemaDocumentRepository: Model<SchemaTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
    @InjectModel(DidId.name)
    protected didIdRepository: Model<DidIdDocument>,
  ) {
    super(
      clientRedis,
      hashService,
      transactionsCounter,
      didIdRepository,
      didSchemaDocumentRepository,
    );

    this.parseService.parsers.set(TransactionType.Schema, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  protected async parseDid(transaction: SchemaTransactionDto) {
    await this.addDocument(transaction);
    const did = await this.didSchemaRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ??
          new this.didSchemaRepository({ id: transaction.body.value.id }),
      );
    await this.updateCoreValues(did, transaction);

    if (transaction.body.value.schema) {
      did.values = transaction.body.value.schema;
    }
    did
      .save()
      .then(() => {
        this.logger.debug({
          message: `added schema ${transaction.body.value.id}`,
          labels: { source: this.constructor.name },
        });
        this.created(transaction);
      })
      .catch((err: any) =>
        this.logger.error({
          message: err,
          labels: { source: this.constructor.name },
        }),
      );
  }

  /**
   * Resets the database
   */
  public reset(): Promise<any> {
    return Promise.all([
      this.didSchemaRepository.deleteMany(),
      this.didTransactionRepository.deleteMany(),
    ]);
  }
}
