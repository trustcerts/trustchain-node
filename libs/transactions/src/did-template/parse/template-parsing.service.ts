import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DidId } from '@trustcerts/core';
import { DidIdDocument } from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidSchema } from '@tc/transactions/did-schema/schemas/did-schema.schema';
import { DidTemplate, TemplateDocument } from '../schemas/did-template.schema';
import {
  DidTemplateTransaction,
  TemplateTransactionDocument,
} from '../schemas/did-template-transaction.schema';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { SchemaCachedService } from '@tc/transactions/did-schema/cached/schema-cached.service';
import { TemplateTransactionDto } from '../dto/template.transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Parses new template transactions.
 */
@Injectable()
export class TemplateParsingService extends ParsingService {
  /**
   * Creates a HashBlockchainService and places listeners for hashes on the blockchainService.
   * @param parser
   * @param clientRedis
   * @param didTemplateRepository
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidTemplate.name)
    private didTemplateRepository: Model<TemplateDocument>,
    @InjectModel(DidTemplateTransaction.name)
    private didTemplateDocumentRepository: Model<TemplateTransactionDocument>,
    private readonly schemaCachedService: SchemaCachedService,
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
      didTemplateDocumentRepository,
    );

    this.parseService.parsers.set(TransactionType.Template, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  protected async parseDid(transaction: TemplateTransactionDto) {
    await this.addDocument(transaction);
    const did = await this.didTemplateRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ??
          new this.didTemplateRepository({ id: transaction.body.value.id }),
      );
    await this.updateCoreValues(did, transaction);

    if (transaction.body.value.schemaId) {
      did.schemaObject = await this.schemaCachedService.getById<DidSchema>(
        transaction.body.value.schemaId,
      );
    }
    if (transaction.body.value.template) {
      this.store(transaction.body.value.id, transaction.body.value.template);
    }
    if (transaction.body.value.compression) {
      did.compression = transaction.body.value.compression;
    }

    did
      .save()
      .then(() => {
        this.logger.debug({
          message: `added template ${transaction.body.value.id}`,
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
      this.didTemplateRepository.deleteMany(),
      this.didTemplateDocumentRepository.deleteMany(),
    ]);
  }

  /**
   * Stores a template on the persisted driver
   * @param id
   * @param template
   */
  private store(id: string, template: string): void {
    if (!existsSync(join(ParsingService.shared_storage, 'tmp'))) {
      mkdirSync(join(ParsingService.shared_storage, 'tmp'));
    }
    writeFileSync(join(ParsingService.shared_storage, 'tmp', id), template);
  }
}
