import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId } from '@trustcerts/did';
import { DidIdDocumentDocument } from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidStatusList } from '@trustcerts/did-status-list';
import {
  DidStatusListTransaction,
  StatusListTransactionDocument,
} from '../schemas/did-status-list-transaction.schema';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { STATUSLIST_CONNECTION } from '../constants';
import { StatusListDocumentDocument } from '../schemas/did-status-list.schema';
import { StatusListTransactionDto } from '../dto/status-list.transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses new statuslist transactions.
 */
@Injectable()
export class StatusListParsingService extends ParsingService<StatusListTransactionDocument> {
  /**
   * Creates a HashBlockchainService and places listeners for hashes on the blockchainService.
   * @param parser
   * @param clientRedis
   * @param didStatusListRepository
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidStatusList.name, STATUSLIST_CONNECTION)
    private didStatusListRepository: Model<StatusListDocumentDocument>,
    @InjectModel(DidStatusListTransaction.name, STATUSLIST_CONNECTION)
    private didStatusListDocumentRepository: Model<StatusListTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
    @InjectModel(DidId.name, DID_ID_CONNECTION)
    protected didIdRepository: Model<DidIdDocumentDocument>,
  ) {
    super(
      clientRedis,
      hashService,
      transactionsCounter,
      didIdRepository,
      didStatusListDocumentRepository,
    );

    this.parseService.parsers.set(TransactionType.StatusList, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  protected async parseDid(transaction: StatusListTransactionDto) {
    await this.addTransaction(transaction);
    const did = await this.didStatusListRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ??
          new this.didStatusListRepository({ id: transaction.body.value.id }),
      );
    await this.updateCoreValues(did, transaction);

    if (transaction.body.value.encodedList) {
      did.encodedList = transaction.body.value.encodedList;
    }

    if (transaction.body.value.statusPurpose) {
      did.statusPurpose = transaction.body.value.statusPurpose;
    }

    did
      .save()
      .then(() => {
        this.logger.debug({
          message: `added statuslist ${transaction.body.value.id}`,
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
      this.didStatusListRepository.deleteMany(),
      this.didStatusListDocumentRepository.deleteMany(),
    ]);
  }
}
