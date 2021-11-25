import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TRACKING_CONNECTION } from './constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: TRACKING_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('traking'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TrackingDbModule {}
