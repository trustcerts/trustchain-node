import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VC_CONNECTION } from '@tc/vc/constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connectionName: VC_CONNECTION,
        uri: configService.db('vc'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class VcDbModule {}
