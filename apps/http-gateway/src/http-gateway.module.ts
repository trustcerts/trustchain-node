import * as Joi from 'joi';
import { ConfigModule } from '@tc/config/config.module';
import { ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/event-client';
import { GatewayDidModule } from './gateway-did/gateway-did.module';
import { GatewayHashModule } from './gateway-hash/gateway-hash.module';
import { GatewayTemplateModule } from './gateway-template/gateway-template.module';
import { HttpGatewayController } from './http-gateway.controller';
import { HttpGatewayService } from './http-gateway.service';
import { Identifier } from '@trustcerts/sdk';
import { InviteModule } from '@tc/invite/invite.module';
import { Module } from '@nestjs/common';
import { ParseClientModule } from '@tc/parse-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { WalletClientModule } from '@tc/wallet-client';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  dynamicHttpValidation,
  httpValidation,
} from '../../shared/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'http',
      environment: {
        INVITE_FORCE: Joi.boolean().default(true),
        MAX_BLOCK_WAIT: Joi.number().default(30),
        ...httpValidation,
        ...dbConnectionValidation,
        DID_NETWORK: Joi.string(),
        OWN_PEER: Joi.string(),
        IMPORT: Joi.string().allow('', null),
      },
      dynamic: {
        ...dynamicHttpValidation,
      },
    }),
    WinstonModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transports: configService.getLoggingTransports(),
      }),
      inject: [ConfigService],
    }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
    GatewayHashModule,
    InviteModule,
    EventClientModule,
    ParseClientModule,
    WalletClientModule,
    GatewayDidModule,
    GatewayTemplateModule,
  ],
  controllers: [HttpGatewayController],
  providers: [HttpGatewayService],
})
export class HttpGatewayModule {
  constructor(configService: ConfigService) {
    Identifier.setNetwork(configService.getString('DID_NETWORK'));
  }
}