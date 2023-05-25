import { Module } from '@nestjs/common';
import { ObserverStatusListController } from './observer-status-list.controller';
import { StatusListCachedModule } from '@tc/transactions/did-status-list/cached/status-list-cached.module';

@Module({
  imports: [StatusListCachedModule],
  controllers: [ObserverStatusListController],
})
export class ObserverStatusListModule {}
