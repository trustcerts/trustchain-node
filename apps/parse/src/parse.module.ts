import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { DidParsingModule } from '@tc/did/did-parsing/did-parsing.module';
import { EventClientModule } from '@tc/event-client';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HashParsingModule } from '@tc/hash/hash-parsing/hash-parsing.module';
import { HealthController } from './health/health.controller';
import { Module } from '@nestjs/common';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';
import { PersistClientModule } from '@tc/persist-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { SchemaCachedModule } from '@tc/schema/schema-cached/schema-cached.module';
import { SchemaParsingModule } from '@tc/schema/schema-parsing/schema-parsing.module';
import { TemplateCachedModule } from '@tc/template/template-cached/template-cached.module';
import { TemplateParsingModule } from '@tc/template/template-parsing/template-parsing.module';
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

    DidParsingModule,
    DidCachedModule,

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
