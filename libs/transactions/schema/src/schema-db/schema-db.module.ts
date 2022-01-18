import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SCHEMA_CONNECTION } from '../constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: SCHEMA_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('schema'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class SchemaDbModule {}
