import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { Module } from '@nestjs/common';
import { ObserverDidController } from './observer-did.controller';
import { ObserverDidGateway } from './observer-did.gateway';

@Module({
  imports: [DidCachedModule],
  controllers: [ObserverDidController],
  providers: [ObserverDidGateway],
})
export class ObserverDidModule {}
