import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/event-client';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { NetworkObserverController } from './network-observer.controller';
import { P2PModule } from '@tc/p2-p';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { WalletClientModule } from '@tc/wallet-client';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  networkDynamicValidation,
  networkValidation,
} from '../../shared/validation-rules';

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
