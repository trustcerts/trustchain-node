import { ConfigModule, ConfigService } from '@tc/config';
import { INVITE_CONNECTION } from '../constants';
import {
  InviteRequest,
  InviteRequestSchema,
} from '../schemas/invite-request.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: INVITE_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('invite'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature(
      [{ name: InviteRequest.name, schema: InviteRequestSchema }],
      INVITE_CONNECTION,
    ),
  ],
})
export class InviteDbModule {}
