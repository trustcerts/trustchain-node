import { ConfigModule, ConfigService } from '@tc/config';
import { DID_ID_CONNECTION } from '@tc/transactions/did-id/constants';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: DID_ID_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('did-id'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [MongooseModule],
})
export class DidIdDbModule {}
