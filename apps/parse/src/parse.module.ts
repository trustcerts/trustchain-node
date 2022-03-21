import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { DidIdParsingModule } from '@tc/transactions/did-id/parse/did-id-parsing.module';
import { EventClientModule } from '@tc/event-client';
import { HashCachedModule } from '@tc/transactions/did-hash/cached/hash-cached.module';
import { HashParsingModule } from '@tc/transactions/did-hash/parse/hash-parsing.module';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';
import { PersistClientModule } from '@tc/persist-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SchemaCachedModule } from '@tc/transactions/did-schema/cached/schema-cached.module';
import { SchemaParsingModule } from '@tc/transactions/did-schema/parse/schema-parsing.module';
import { TemplateCachedModule } from '@tc/transactions/did-template/cached/template-cached.module';
import { TemplateParsingModule } from '@tc/transactions/did-template/parse/template-parsing.module';
import { TerminusModule } from '@nestjs/terminus';
import { WinstonModule } from 'nest-winston';
import { dbConnectionValidation } from '@shared/validation-rules';
@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'parse',
      environment: {
        ...dbConnectionValidation,
        DB_SYNC: Joi.boolean().default(true),
        TEMP_STORAGE: Joi.string(),
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
    EventClientModule,
    PersistClientModule,

    HashParsingModule,
    HashCachedModule,

    DidIdParsingModule,
    DidIdCachedModule,

    SchemaParsingModule,
    SchemaCachedModule,

    TemplateParsingModule,
    TemplateCachedModule,
  ],
  controllers: [ParseController, HealthController],
  providers: [ParseService],
  exports: [ParseService],
})
export class ParseModule {}
