import { ConfigModule } from '@tc/config';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HttpConfigService } from '../../../shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ObserverHashController } from './observer-hash.controller';
import { ObserverHashGateway } from './observer-hash.gateway';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    HashCachedModule,
    TrackingModule,
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
  ],
  providers: [ObserverHashGateway],
  controllers: [ObserverHashController],
})
export class ObserverHashModule {}
