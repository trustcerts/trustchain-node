import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId } from '@trustcerts/did';
import { DidIdDocumentDocument } from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidVisualRepresentation } from '@trustcerts/did-visual-representation';
import {
  DidVisualRepresentationTransaction,
  VisualRepresentationTransactionDocument,
} from '../schemas/did-visual-representation-transaction.schema';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { VISUALREPRESENTATION_CONNECTION } from '../constants';
import { VisualRepresentationDocumentDocument } from '../schemas/did-visual-representation.schema';
import { VisualRepresentationTransactionDto } from '../dto/visual-representation.transaction.dto';

/**
 * Parses new visualrepresentation transactions.
 */
@Injectable()
export class VisualRepresentationParsingService extends ParsingService<VisualRepresentationTransactionDocument> {
  /**
   * Creates a HashBlockchainService and places listeners for hashes on the blockchainService.
   * @param parser
   * @param clientRedis
   * @param didVisualRepresentationRepository
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidVisualRepresentation.name, VISUALREPRESENTATION_CONNECTION)
    private didVisualRepresentationRepository: Model<VisualRepresentationDocumentDocument>,
    @InjectModel(
      DidVisualRepresentationTransaction.name,
      VISUALREPRESENTATION_CONNECTION,
    )
    private didVisualRepresentationDocumentRepository: Model<VisualRepresentationTransactionDocument>,
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
      didVisualRepresentationDocumentRepository,
    );

    this.parseService.parsers.set(TransactionType.VisualRepresentation, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new entry to the database.
   * @param transaction
   */
  protected async parseDid(transaction: VisualRepresentationTransactionDto) {
    await this.addTransaction(transaction);
    const did = await this.didVisualRepresentationRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ??
          new this.didVisualRepresentationRepository({
            id: transaction.body.value.id,
          }),
      );
    await this.updateCoreValues(did, transaction);

    if (transaction.body.value.presentation) {
      if (!did.presentation) did.presentation = [];
      if (transaction.body.value.presentation!.remove) {
        did.presentation = did.presentation.filter(
          (usedKey) =>
            !transaction.body.value.presentation!.remove?.includes(usedKey.id),
        );
      }
      if (transaction.body.value.presentation!.add) {
        did.presentation.push(...transaction.body.value.presentation!.add!);
      }
    }

    did
      .save()
      .then(() => {
        this.logger.debug({
          message: `added visualrepresentation ${transaction.body.value.id}`,
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
      this.didVisualRepresentationRepository.deleteMany(),
      this.didVisualRepresentationDocumentRepository.deleteMany(),
    ]);
  }
}
