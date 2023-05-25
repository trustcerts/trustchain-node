import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { STATUSLIST_CONNECTION } from '../constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: STATUSLIST_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db(),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class StatusListDbModule {}
