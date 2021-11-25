import { DidDbModule } from '@tc/did/did-db/did-db.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { ObserverHealthController } from './observer-health.controller';
import { ObserverHealthService } from './observer-health.service';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HashModule, DidDbModule],
  controllers: [ObserverHealthController],
  providers: [ObserverHealthService],
})
export class ObserverHealthModule {}
