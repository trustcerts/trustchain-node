import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParsingService as Parser } from '@tc/parsing';
import { ParsingService } from '@shared/parsing.service';
import { REDIS_INJECTION } from 'libs/clients/event-client/src/constants';
import { Security, SecurityDocument } from '@tc/security/security.entity';
import { SecurityLimitTransactionDto } from '@tc/security/rate-limit/security-limit.transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses security related transactions.
 */
@Injectable()
export class RateLimitParsingService extends ParsingService {
  /**
   * Creates a CertParsingService.
   * @param parser
   * @param logger
   * @param clientRedis
   * @param hashService
   * @param securityModel
   * @param transactionsCounter
   */
  constructor(
    protected readonly parser: Parser,
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
  ) {
    super(clientRedis, parser, hashService, transactionsCounter);
    this.parser.emitter.on(
      TransactionType[TransactionType.SecurityLimit],
      this.addLimit.bind(this),
    );
  }

  /**
   * Updates the limit of an account.
   * @param transaction
   */
  private async addLimit(transaction: SecurityLimitTransactionDto) {
    this.logger.debug({
      message: `Update limit from ${transaction.body.value.identifier} to ${transaction.body.value.amount}`,
      labels: { source: this.constructor.name },
    });
    await this.securityModel.findOneAndUpdate(
      { id: transaction.body.value.identifier },
      {
        limit: transaction.body.value.amount,
      },
    );
    this.created(transaction).then();
  }
}
