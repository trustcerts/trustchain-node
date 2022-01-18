import { ClientModule } from '@shared/client.module';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { PERSIST_PORT_HTTP, PERSIST_URL } from './constants';
import { PersistClientService } from './persist-client.service';
import { persistTcpProvider } from '@tc/persist-client/persist.provider';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  providers: [persistTcpProvider, PersistClientService],
  exports: [persistTcpProvider, PersistClientService],
})
export class PersistClientModule
  extends ClientModule
  implements OnApplicationBootstrap
{
  constructor(
    @Inject('winston') logger: Logger,
    httpService: HttpService,
    protected configService: ConfigService,
  ) {
    super(configService, httpService, logger);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.isHealthy(
      this.configService.getString(PERSIST_URL),
      this.configService.getNumber(PERSIST_PORT_HTTP),
    );
  }
}
