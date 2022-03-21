import { DidIdDbModule } from '@tc/transactions/did-id/db/did-id-db.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { ObserverHealthController } from './observer-health.controller';
import { ObserverHealthService } from './observer-health.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HashModule, DidIdDbModule],
  controllers: [ObserverHealthController],
  providers: [ObserverHealthService],
})
export class ObserverHealthModule {}
