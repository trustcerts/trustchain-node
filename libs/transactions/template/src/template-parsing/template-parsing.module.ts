import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { DidTemplate, TemplateSchema } from '../schemas/did-template.schema';
import {
  DidTemplateTransaction,
  TemplateTransactionSchema,
} from '../schemas/did-template-transaction.schema';
import { EventClientModule } from '@tc/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { TEMPLATE_CONNECTION } from '../constants';
import { TemplateDbModule } from '../template-db/template-db.module';
import { TemplateParsingService } from './template-parsing.service';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    TemplateDbModule,
    DidIdCachedModule,
    MongooseModule.forFeature(
      [
        { name: DidTemplate.name, schema: TemplateSchema },
        {
          name: DidTemplateTransaction.name,
          schema: TemplateTransactionSchema,
        },
      ],
      TEMPLATE_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    TemplateParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class TemplateParsingModule {}
