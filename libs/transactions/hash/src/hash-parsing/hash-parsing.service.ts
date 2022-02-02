import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DidHash, HashDocument } from '@tc/hash/schemas/did-hash.schema';
import {
  DidHashTransaction,
  HashTransactionDocument,
} from '../schemas/did-hash-transaction.schema';
import { DidId } from '@trustcerts/core';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { DidIdDocument } from '@tc/did-id/schemas/did-id.schema';
import { HashService } from '@tc/blockchain';
import { HashTransactionDto } from '../dto/hash-transaction.dto';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@shared/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses transactions that deal with hashes.
 */
@Injectable()
export class HashParsingService extends ParsingService {
  /**
   * Creates a HashBlockchainService and places listeners for hashes on the blockchainService.
   * @param parser
   * @param clientRedis
   * @param logger
   * @param didSchemaRepository
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidHash.name) private didSchemaRepository: Model<HashDocument>,
    @InjectModel(DidHashTransaction.name)
    didHashDocumentRegistry: Model<HashTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
    readonly didIdCachedService: DidIdCachedService,
    @InjectModel(DidId.name)
    protected didIdRepository: Model<DidIdDocument>,
  ) {
    super(
      clientRedis,
      hashService,
      transactionsCounter,
      didIdRepository,
      didHashDocumentRegistry,
    );

    this.parseService.parsers.set(TransactionType.Hash, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new hash from the given transaction.
   * @param transaction
   */
  async parseDid(transaction: HashTransactionDto) {
    await this.addDocument(transaction);
    const did = await this.didSchemaRepository
      .findOne({ id: transaction.body.value.id })
      .then(async (did) => {
        console.log(transaction);
        if (!did) {
          did = new this.didSchemaRepository({
            id: transaction.body.value.id,
            createdAt: transaction.body.date,
            values: transaction.body.value,
            didDocumentSignature: transaction.metadata!.didDocSignature!.values,
            signature: transaction.signature.values,
            block: {
              ...transaction.block,
              imported: transaction.metadata?.imported?.date,
            },
          } as DidHashTransaction);
        }
        return did;
      });

    await this.updateController(did, transaction);
    if (transaction.body.value.revoked) {
      did.revokedAt = new Date(transaction.body.value.revoked);
    }
    did
      .save()
      .then(() => {
        this.logger.debug({
          message: `added hash ${transaction.body.value.id}`,
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
   * Resets a database.
   */
  public async reset(): Promise<void> {
    await this.didSchemaRepository.deleteMany();
  }
}
