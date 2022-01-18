import { DID_CONNECTION } from '@tc/did/constants';
import { DidCachedService } from './did-cached.service';
import { DidDbModule } from '@tc/did/did-db/did-db.module';
import { DidId, DidIdSchema } from '../schemas/did.schema';
import {
  DidIdTransaction,
  DidTransactionSchema,
} from '@tc/did/schemas/did-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PersistClientModule } from '@tc/persist-client';

@Module({
  imports: [
    DidDbModule,
    PersistClientModule,
    MongooseModule.forFeature(
      [
        { name: DidIdTransaction.name, schema: DidTransactionSchema },
        { name: DidId.name, schema: DidIdSchema },
      ],
      DID_CONNECTION,
    ),
  ],
  providers: [DidCachedService],
  exports: [DidCachedService],
})
export class DidCachedModule {}
