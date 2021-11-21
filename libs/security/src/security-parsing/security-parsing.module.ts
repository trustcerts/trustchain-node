import { EventClientModule } from '@tc/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import { ParsingModule } from '@tc/parsing';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { SECURITY_CONNECTION } from '@tc/security/constants';
import { Security, SecuritySchema } from '@tc/security/security.entity';
import { SecurityDbModule } from '@tc/security/security-db/security-db.module';
import { SecurityParsingService } from '@tc/security/security-parsing/security-parsing.service';

@Module({
  imports: [
    ParsingModule,
    forwardRef(() => ParseModule),
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
    SecurityParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class SecurityParsingModule {}
