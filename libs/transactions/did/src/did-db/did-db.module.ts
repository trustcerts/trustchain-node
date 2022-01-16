import { ConfigModule, ConfigService } from '@tc/config';
import { DID_CONNECTION } from '@tc/did/constants';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: DID_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('did'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DidDbModule {}
