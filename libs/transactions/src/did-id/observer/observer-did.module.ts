import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { Module } from '@nestjs/common';
import { ObserverDidController } from './observer-did.controller';

@Module({
  imports: [DidIdCachedModule],
  controllers: [ObserverDidController],
})
export class ObserverDidModule {}
