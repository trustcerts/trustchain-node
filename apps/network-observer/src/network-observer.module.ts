import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from 'libs/clients/event-client/src';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { NetworkObserverController } from './network-observer.controller';
import { P2PModule } from '@tc/p2-p';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { WalletClientModule } from 'libs/clients/wallet-client/src';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  networkDynamicValidation,
  networkValidation,
} from '../../shared/constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'network',
      environment: {
        IS_VALIDATOR: Joi.boolean().default(false),
        ...networkValidation,
        ...dbConnectionValidation,
      },
      dynamic: {
        ...networkDynamicValidation,
      },
    }),
    TerminusModule,
    P2PModule,
    WalletClientModule,
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
    EventClientModule,
  ],
  controllers: [NetworkObserverController, HealthController],
})
export class NetworkObserverModule {}
