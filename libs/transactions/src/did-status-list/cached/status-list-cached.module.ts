import { DidStatusList } from '@trustcerts/did-status-list';
import {
  DidStatusListTransaction,
  StatusListTransactionSchema,
} from '../schemas/did-status-list-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { STATUSLIST_CONNECTION } from '../constants';
import { StatusListCachedService } from './status-list-cached.service';
import { StatusListDbModule } from '../db/status-list-db.module';
import { StatusListSchema } from '../schemas/did-status-list.schema';

@Module({
  imports: [
    StatusListDbModule,
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
  ],
  providers: [StatusListCachedService],
  exports: [StatusListCachedService],
})
export class StatusListCachedModule {}
