import { DidIdCachedModule } from '@tc/did-id/cached/did-id-cached.module';
import { INVITE_CONNECTION } from './constants';
import { InviteDbModule } from './invite-db/invite-db.module';
import {
  InviteRequest,
  InviteRequestSchema,
} from './schemas/invite-request.schema';
import { InviteService } from './invite.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    DidIdCachedModule,
    InviteDbModule,
    MongooseModule.forFeature(
      [{ name: InviteRequest.name, schema: InviteRequestSchema }],
      INVITE_CONNECTION,
    ),
  ],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
