import * as Joi from 'joi';
import { ConfigModule } from '@tc/config/config.module';
import { ConfigService } from '@tc/config';
import { EventClientModule } from 'libs/clients/event-client/src';
import { HealthController } from './health/health.controller';
import { HttpValidatorController } from './http-validator.controller';
import { HttpValidatorService } from './http-validator.service';
import { Identifier } from '@trustcerts/core';
import { Module } from '@nestjs/common';
import { ParseClientModule } from 'libs/clients/parse-client/src';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { ValidatorDidModule } from './validator-did/validator-did.module';
import { WalletClientModule } from 'libs/clients/wallet-client/src';
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
        ...httpValidation,
        ...dbConnectionValidation,
        DID_NETWORK: Joi.string(),
        OWN_PEER: Joi.string(),
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
    TerminusModule,
    EventClientModule,
    ParseClientModule,
    WalletClientModule,
    ValidatorDidModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  controllers: [HttpValidatorController, HealthController],
  providers: [HttpValidatorService],
  // needs export for prometheus module
  exports: [ConfigModule],
})
export class HttpValidatorModule {
  constructor(configService: ConfigService) {
    Identifier.setNetwork(configService.getString('DID_NETWORK'));
  }
}
