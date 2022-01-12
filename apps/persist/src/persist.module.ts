import { ConfigModule, ConfigService } from '@tc/config';
import { EventClientModule } from '@tc/event-client';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { PersistController } from './persist.controller';
import { PersistService } from './persist.service';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'persist',
      environment: {},
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
    EventClientModule,
    TerminusModule,
  ],
  controllers: [PersistController, HealthController],
  providers: [
    PersistService,
    makeCounterProvider({
      name: 'blockchainLength',
      help: 'length of the blockchain',
    }),
  ],
})
export class PersistModule {}
