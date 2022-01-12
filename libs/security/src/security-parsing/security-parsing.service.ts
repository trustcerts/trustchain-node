import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService as Parser } from '@tc/parsing';
import { ParsingService } from '@shared/parsing.service';
import { REDIS_INJECTION } from 'libs/clients/event-client/src/constants';
import { Security, SecurityDocument } from '@tc/security/security.entity';

/**
 * Parses security related transactions.
 */
@Injectable()
export class SecurityParsingService extends ParsingService {
  /**
   * Creates a CertParsingService.
   * @param parser
   * @param logger
   * @param clientRedis
   * @param hashService
   * @param securityRepository
   * @param transactionsCounter
   */
  constructor(
    protected readonly parser: Parser,
    protected readonly hashService: HashService,
    @Inject('winston') protected readonly logger: Logger,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @InjectModel(Security.name) private securityModel: Model<SecurityDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(clientRedis, parser, hashService, transactionsCounter);
    // TODO implement this feature in the did context
    this.parseService.modules.push(this.securityModel);
  }
}
