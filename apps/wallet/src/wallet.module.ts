import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/clients/event-client';
import { HealthController } from './health/health.controller';
import { Identifier } from '@trustcerts/did';
import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'wallet',
      environment: {
        DID_NETWORK: Joi.string(),
      },
      dynamic: {
        IDENTIFIER: Joi.string(),
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
    TerminusModule,
    //TODO evaluate if the wallet module should be able to make this call
    EventClientModule,
  ],
  controllers: [WalletController, HealthController],
  providers: [WalletService],
})
export class WalletModule {
  constructor(configService: ConfigService) {
    Identifier.setNetwork(configService.getString('DID_NETWORK'));
  }
}
