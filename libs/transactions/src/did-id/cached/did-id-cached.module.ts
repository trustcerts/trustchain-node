import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId } from '@trustcerts/did';
import { DidIdCachedService } from './did-id-cached.service';
import { DidIdDbModule } from '../db/did-id-db.module';
import { DidIdSchema } from '../schemas/did-id.schema';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/transactions/did-id/schemas/did-id-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersistClientModule } from '@tc/clients/persist-client';

@Module({
  imports: [
    DidIdDbModule,
    PersistClientModule,
    MongooseModule.forFeature(
      [
        { name: DidIdTransaction.name, schema: DidTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      DID_ID_CONNECTION,
    ),
  ],
  providers: [DidIdCachedService],
  exports: [DidIdCachedService, MongooseModule],
})
export class DidIdCachedModule {}
