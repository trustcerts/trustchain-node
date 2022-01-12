import { EventClientModule } from 'libs/clients/event-client/src';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParsingModule } from '@tc/parsing';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { RateLimitParsingService } from '@tc/security/rate-limit/rate-limit-parsing/rate-limit-parsing.service';
import { SECURITY_CONNECTION } from '@tc/security/constants';
import { Security, SecuritySchema } from '@tc/security/security.entity';
import { SecurityDbModule } from '@tc/security/security-db/security-db.module';

@Module({
  imports: [
    ParsingModule,
    EventClientModule,
    SecurityDbModule,
    HashModule,
    MongooseModule.forFeature(
      [{ name: Security.name, schema: SecuritySchema }],
      SECURITY_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    RateLimitParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
  exports: [RateLimitParsingService],
})
export class RateLimitParsingModule {}
