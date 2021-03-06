import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/clients/event-client';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { NetworkGatewayController } from './network-gateway.controller';
import { NetworkGatewayService } from './network-gateway.service';
import { P2PModule } from '@tc/p2-p';
import { PersistClientModule } from '@tc/clients/persist-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  networkDynamicValidation,
  networkValidation,
} from '@shared/validation-rules';

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
  ],
  controllers: [NetworkGatewayController, HealthController],
  providers: [NetworkGatewayService],
})
export class NetworkGatewayModule {}
