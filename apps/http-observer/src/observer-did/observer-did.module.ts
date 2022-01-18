import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { Module } from '@nestjs/common';
import { ObserverDidController } from './observer-did.controller';

@Module({
  imports: [DidCachedModule],
  controllers: [ObserverDidController],
})
export class ObserverDidModule {}
