import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@shared/parsing.service';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { Template, TemplateDocument } from '../schemas/template.schema';
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
   * @param templateModel
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Template.name)
    private templateModel: Model<TemplateDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(clientRedis, hashService, transactionsCounter);

    this.parseService.parsers.set(TransactionType.Template, {
      parsing: this.add.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  private async add(transaction: TemplateTransactionDto) {
    this.store(transaction.body.value.id, transaction.body.value.template);
    const template = new this.templateModel({
      id: transaction.body.value.id,
      compression: transaction.body.value.compression,
      schema: transaction.body.value.schema,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
      signature: transaction.signature.values,
    });
    await template.save().catch((err: any) =>
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
    await this.templateModel.deleteMany();
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
