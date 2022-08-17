import {
  DidStatusList,
  StatusListSchema,
} from '../schemas/did-status-list.schema';
import {
  DidStatusListTransaction,
  StatusListTransactionSchema,
} from '../schemas/did-status-list-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { STATUSLIST_CONNECTION } from '../constants';
import { StatusListCachedService } from './status-list-cached.service';
import { StatusListDbModule } from '../db/status-list-db.module';

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
