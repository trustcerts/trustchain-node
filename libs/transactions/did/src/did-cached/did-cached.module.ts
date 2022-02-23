import { DID_CONNECTION } from '@tc/did/constants';
import { Did, DidSchema } from '../schemas/did.schema';
import { DidCachedService } from './did-cached.service';
import { DidDbModule } from '@tc/did/did-db/did-db.module';
import {
  DidTransaction,
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
        { name: DidTransaction.name, schema: DidTransactionSchema },
        { name: Did.name, schema: DidSchema },
      ],
      DID_CONNECTION,
    ),
  ],
  providers: [DidCachedService],
  exports: [DidCachedService],
})
export class DidCachedModule {}
