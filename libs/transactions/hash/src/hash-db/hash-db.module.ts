import { ConfigModule, ConfigService } from '@tc/config';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: HASH_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('hash'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class HashDbModule {}
