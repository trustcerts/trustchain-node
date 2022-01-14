import { ClientModule } from 'libs/clients/client.module';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { PARSE_PORT_HTTP, PARSE_URL } from './constants';
import { parseTcpProvider } from '@tc/parse-client/parse.provider';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  providers: [parseTcpProvider],
  exports: [parseTcpProvider],
})
export class ParseClientModule
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
    configService: ConfigService,
  ) {
    super(configService, httpService, logger);
  }

  onApplicationBootstrap(): Promise<void> {
    return this.isHealthy(
      this.configService.getString(PARSE_URL),
      this.configService.getNumber(PARSE_PORT_HTTP),
    );
  }
}
