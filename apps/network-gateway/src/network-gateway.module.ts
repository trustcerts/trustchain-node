import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/event-client';
import { HashBlockchainModule } from '@tc/hash/hash-blockchain/hash-blockchain.module';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { NetworkGatewayController } from './network-gateway.controller';
import { NetworkGatewayService } from './network-gateway.service';
import { P2PModule } from '@tc/p2-p';
import { PersistClientModule } from '@tc/persist-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { RateLimitBlockchainModule } from '@tc/security/rate-limit/rate-limit-blockchain/rate-limit-blockchain.module';
import { TerminusModule } from '@nestjs/terminus';
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
    P2PModule,
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
    EventClientModule,
    PersistClientModule,
    HashBlockchainModule,
    RateLimitBlockchainModule,
  ],
  controllers: [NetworkGatewayController, HealthController],
  providers: [NetworkGatewayService],
})
export class NetworkGatewayModule {}
