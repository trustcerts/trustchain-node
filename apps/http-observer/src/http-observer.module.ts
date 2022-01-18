import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { HttpObserverController } from './http-observer.controller';
import { HttpObserverService } from './http-observer.service';
import { HttpSharedModule } from '@shared/http/http-shared.module';
import { Module } from '@nestjs/common';
import { ObserverDidModule } from './observer-did/observer-did.module';
import { ObserverHashModule } from './observer-hash/observer-hash.module';
import { ObserverSchemaModule } from './observer-schema/observer-schema.module';
import { ObserverTemplateModule } from './observer-template/observer-template.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { TrackingModule } from './tracking/tracking.module';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  dynamicHttpValidation,
  httpValidation,
} from '@shared/validation-rules';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'http',
      environment: {
        ...httpValidation,
        ...dbConnectionValidation,
        TEMP_STORAGE: Joi.string(),
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
    // PromModule.forRoot({
    //   defaultLabels: {
    //     service: 'http',
    //   },
    // }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
    HttpSharedModule,

    ObserverHashModule,
    TrackingModule,
    ObserverDidModule,
    ObserverTemplateModule,
    ObserverSchemaModule,
  ],
  controllers: [HttpObserverController],
  providers: [HttpObserverService],
})
export class HttpObserverModule {}
