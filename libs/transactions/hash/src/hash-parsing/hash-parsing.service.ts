import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
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
import { ParsingService as Parser } from '@tc/parsing';
import { ParsingService } from '@shared/parsing.service';
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
    protected readonly parser: Parser,
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Hash.name) private hashModel: Model<HashDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(clientRedis, parser, hashService, transactionsCounter);
    this.parser.emitter.on(
      TransactionType[TransactionType.HashCreation],
      this.add.bind(this),
    );
    this.parser.emitter.on(
      TransactionType[TransactionType.HashRevocation],
      this.revoke.bind(this),
    );
    this.parseService.modules.push(this.hashModel);
  }

  /**
   * Adds a new hash from the given transaction.
   * @param transaction
   */
  async add(transaction: HashCreationTransactionDto) {
    const hash = new this.hashModel({
      hash: transaction.body.value.hash,
      signature: transaction.signature.values,
      createdAt: transaction.body.date,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
      hashAlgorithm: transaction.body.value.algorithm,
    });
    await hash
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
      { hash: transaction.body.value.hash },
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
}
