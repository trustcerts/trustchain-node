import {
  DidVisualRepresentationTransaction,
  VisualRepresentationTransactionSchema,
} from '../schemas/did-visual-representation-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VISUALREPRESENTATION_CONNECTION } from '../constants';
import { VisualRepresentationCachedService } from './visual-representation-cached.service';
import { VisualRepresentationDbModule } from '../db/visual-representation-db.module';
import { VisualRepresentationSchema } from '../schemas/did-visual-representation.schema';

@Module({
  imports: [
    VisualRepresentationDbModule,
    MongooseModule.forFeature(
      [
        {
          name: 'DidVisualRepresentation',
          schema: VisualRepresentationSchema,
        },
        {
          name: DidVisualRepresentationTransaction.name,
          schema: VisualRepresentationTransactionSchema,
        },
      ],
      VISUALREPRESENTATION_CONNECTION,
    ),
  ],
  providers: [VisualRepresentationCachedService],
  exports: [VisualRepresentationCachedService],
})
export class VisualRepresentationCachedModule {}
