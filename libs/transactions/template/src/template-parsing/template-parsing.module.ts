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
import { Template, TemplateSchema } from '../schemas/template.schema';
import { TemplateDbModule } from '../template-db/template-db.module';
import { TemplateParsingService } from './template-parsing.service';
import {
  TemplateTransaction,
  TemplateTransactionSchema,
} from '../schemas/template-transaction.schema';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    TemplateDbModule,
    MongooseModule.forFeature(
      [
        { name: Template.name, schema: TemplateSchema },
        { name: TemplateTransaction.name, schema: TemplateTransactionSchema },
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
