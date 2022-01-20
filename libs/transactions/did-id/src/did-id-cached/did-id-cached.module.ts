import { DID_ID_CONNECTION } from '@tc/did-id/constants';
import { DidId, DidIdSchema } from '../schemas/did-id.schema';
import { DidIdCachedService } from './did-id-cached.service';
import { DidIdDbModule } from '../did-id-db/did-id-db.module';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/did-id/schemas/did-id-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersistClientModule } from '@tc/persist-client';

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
  exports: [DidIdCachedService],
})
export class DidIdCachedModule {}
