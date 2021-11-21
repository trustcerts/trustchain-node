import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TEMPLATE_CONNECTION } from '../constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: TEMPLATE_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('template'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class TemplateDbModule {}
