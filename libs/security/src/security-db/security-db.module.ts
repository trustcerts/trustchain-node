import { ConfigModule, ConfigService } from '@tc/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SECURITY_CONNECTION } from '@tc/security/constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: SECURITY_CONNECTION,
      useFactory: async (configService: ConfigService) => ({
        uri: configService.db('security'),
        retryAttempts: 1,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class SecurityDbModule {}
