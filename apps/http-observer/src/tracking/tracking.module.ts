import { DID_CONNECTION } from '@tc/did/constants';
import { Did, DidSchema } from '@tc/did/schemas/did.schema';
import { DidDbModule } from '@tc/did/did-db/did-db.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TRACKING_CONNECTION } from './constants';
import { Tracking, TrackingSchema } from './tracking.entity';
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
      [{ name: Did.name, schema: DidSchema }],
      DID_CONNECTION,
    ),
    DidDbModule,
  ],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
