import { DID_CONNECTION } from '@tc/did/constants';
import { DidDbModule } from '@tc/did/did-db/did-db.module';
import { DidId, DidIdSchema } from '@tc/did/schemas/did.schema';
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
      DID_CONNECTION,
    ),
    DidDbModule,
  ],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
