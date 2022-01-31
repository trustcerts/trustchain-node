import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { Hash, HashDocument } from '@tc/hash/schemas/hash.schema';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';
import { HashService } from '@tc/blockchain';
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
   * @param hashModel
   * @param hashService
   * @param transactionsCounter
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Hash.name) private hashModel: Model<HashDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
    private readonly didIdCachedService: DidIdCachedService,
  ) {
    super(clientRedis, hashService, transactionsCounter);

    this.parseService.parsers.set(TransactionType.HashCreation, {
      parsing: this.add.bind(this),
      reset: this.reset.bind(this),
    });

    this.parseService.parsers.set(TransactionType.HashRevocation, {
      parsing: this.revoke.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds a new hash from the given transaction.
   * @param transaction
   */
  async add(transaction: HashCreationTransactionDto) {
    new this.hashModel({
      id: transaction.body.value.hash,
      signature: transaction.signature.values,
      createdAt: transaction.body.date,
      controllers: await Promise.all(
        transaction.signature.values.map((value) =>
          this.didIdCachedService.getById(value.identifier.split('#')[0]),
        ),
      ),
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
      hashAlgorithm: transaction.body.value.algorithm,
    })
      .save()
      .then(() => {
        this.logger.debug({
          message: `added hash ${transaction.body.value.hash}`,
          labels: { source: this.constructor.name },
        });
        this.created(transaction);
      })
      .catch((err) => {
        // TODO check if error is thrown
        this.logger.error({
          message: err,
          labels: { source: this.constructor.name },
        });
      });
  }

  /**
   * Revokes a hash from the given transaction.
   * @param transaction
   */
  async revoke(transaction: HashRevocationTransactionDto) {
    await this.hashModel.findOneAndUpdate(
      { id: transaction.body.value.hash },
      {
        revokedAt: new Date(transaction.body.date),
      },
    );
    this.logger.debug({
      message: `revoked hash ${transaction.body.value.hash}`,
      labels: { source: this.constructor.name },
    });
    this.created(transaction).then();
  }

  /**
   * Resets a database.
   */
  public async reset(): Promise<void> {
    await this.hashModel.deleteMany();
  }
}
