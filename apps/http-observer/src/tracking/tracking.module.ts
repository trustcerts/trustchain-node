import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { DidId } from '@trustcerts/did';
import { DidIdDbModule } from '@tc/transactions/did-id/db/did-id-db.module';
import { DidIdSchema } from '@tc/transactions/did-id/schemas/did-id.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TRACKING_CONNECTION } from './constants';
import { Tracking, TrackingSchema } from './schemas/tracking.schema';
import { TrackingDbModule } from './tracking-db.module';
import { TrackingService } from './tracking.service';

@Module({
  imports: [
    TrackingDbModule,
    MongooseModule.forFeature(
      [{ name: Tracking.name, schema: TrackingSchema }],
      TRACKING_CONNECTION,
    ),
    MongooseModule.forFeature(
      [{ name: DidId.name, schema: DidIdSchema }],
      DID_ID_CONNECTION,
    ),
    DidIdDbModule,
  ],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
