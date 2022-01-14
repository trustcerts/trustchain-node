import { ClientModule } from 'libs/clients/client.module';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { NETWORK_PORT_HTTP, NETWORK_URL } from './constants';
import { networkTcpProvider } from '@tc/network-client/network.provider';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  providers: [networkTcpProvider],
  exports: [networkTcpProvider],
})
export class NetworkClientModule
  extends ClientModule
  implements OnApplicationBootstrap
{
  /**
   *
   * @param logger
   * @param httpService
   * @param configService
   */
  constructor(
    @Inject('winston') logger: Logger,
    httpService: HttpService,
    protected configService: ConfigService,
  ) {
    super(configService, httpService, logger);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.isHealthy(
      this.configService.getString(NETWORK_URL),
      this.configService.getNumber(NETWORK_PORT_HTTP),
    );
  }
}
