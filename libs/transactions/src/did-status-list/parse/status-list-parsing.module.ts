import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { DidStatusList } from '@trustcerts/did-status-list';
import {
  DidStatusListTransaction,
  StatusListTransactionSchema,
} from '../schemas/did-status-list-transaction.schema';
import { EventClientModule } from '@tc/clients/event-client';
import { HashModule } from '@tc/blockchain';
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ParseModule } from '@apps/parse/src/parse.module';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';
import { STATUSLIST_CONNECTION } from '../constants';
import { SchemaCachedModule } from '@tc/transactions/did-schema/cached/schema-cached.module';
import { StatusListDbModule } from '../db/status-list-db.module';
import { StatusListParsingService } from './status-list-parsing.service';
import { StatusListSchema } from '../schemas/did-status-list.schema';

@Module({
  imports: [
    forwardRef(() => ParseModule),
    EventClientModule,
    HashModule,
    StatusListDbModule,
    DidIdCachedModule,
    SchemaCachedModule,
    MongooseModule.forFeature(
      [
        { name: DidStatusList.name, schema: StatusListSchema },
        {
          name: DidStatusListTransaction.name,
          schema: StatusListTransactionSchema,
        },
      ],
      STATUSLIST_CONNECTION,
    ),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    StatusListParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
})
export class StatusListParsingModule {}
