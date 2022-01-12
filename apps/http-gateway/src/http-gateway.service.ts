import { ClientRedis, ClientTCP } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { HttpService } from '../../shared/http/http.service';
import { Inject, Injectable } from '@nestjs/common';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { Logger } from 'winston';
import { PARSE_TCP_INJECTION } from '../../shared/constants';
import {
  REDIS_INJECTION,
  SYSTEM_INIT,
} from 'libs/clients/event-client/src/constants';
import { WalletClientService } from 'libs/clients/wallet-client/src';

/**
 * Service to interact with the gateway from external.
 */
@Injectable()
export class HttpGatewayService extends HttpService {
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
