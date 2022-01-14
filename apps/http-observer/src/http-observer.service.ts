import { ClientRedis, ClientTCP } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { HttpService } from '../../shared/http/http.service';
import { Inject, Injectable } from '@nestjs/common';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { Logger } from 'winston';
import { PARSE_TCP_INJECTION } from '@tc/parse-client/constants';
import { REDIS_INJECTION, SYSTEM_INIT } from '@tc/event-client/constants';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service to interact with the Observer from external.
 */
@Injectable()
export class HttpObserverService extends HttpService {
  /**
   * Injects required services.
   * @param clientParse
   * @param clientRedis
   * @param logger
   * @param configService
   * @param walletClientService
   */
  constructor(
    @Inject(PARSE_TCP_INJECTION) protected clientParse: ClientTCP,
    @Inject(REDIS_INJECTION) protected clientRedis: ClientRedis,
    @Inject('winston') private readonly logger: Logger,
    protected readonly configService: ConfigService,
    private readonly walletClientService: WalletClientService,
  ) {
    super(clientParse, clientRedis, configService);
  }

  /**
   * Requests a certificate with the given invite code.
   * @param invite
   */
  invite(invite: InviteNode) {
    return this.walletClientService
      .requestSignedDid(invite)
      .then((nodeUrls) => {
        this.logger.debug({
          message: 'got signed key',
          labels: { source: this.constructor.name },
        });
        this.clientRedis.emit(SYSTEM_INIT, nodeUrls[0]);
      });
  }
}
