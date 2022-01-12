import { ClientModule } from '@shared/client.module';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { WALLET_PORT_HTTP, WALLET_URL } from './constants';
import { WalletClientService } from './wallet-client.service';
import { walletTcpProvider } from 'libs/clients/wallet-client/src/wallet.provider';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  providers: [WalletClientService, walletTcpProvider],
  exports: [WalletClientService, walletTcpProvider],
})
export class WalletClientModule
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
      this.configService.getString(WALLET_URL),
      this.configService.getNumber(WALLET_PORT_HTTP),
    );
  }
}
