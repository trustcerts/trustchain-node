import { ClientRedis, ClientTCP } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { HttpService } from '../../shared/http/http.service';
import { Inject, Injectable } from '@nestjs/common';
import { PARSE_TCP_INJECTION } from '../../shared/constants';
import { REDIS_INJECTION } from 'libs/clients/event-client/src/constants';

/**
 * Service for the http controller to interact with the internal system.
 */
@Injectable()
export class HttpValidatorService extends HttpService {
  /**
   * Imports required services.
   * @param clientParse
   * @param clientRedis
   * @param configService
   */
  constructor(
    @Inject(PARSE_TCP_INJECTION) protected clientParse: ClientTCP,
    @Inject(REDIS_INJECTION) protected clientRedis: ClientRedis,
    protected readonly configService: ConfigService,
  ) {
    super(clientParse, clientRedis, configService);
  }
}
