import { GatewayHealthController } from './gateway-health.controller';
import { GatewayHealthService } from './gateway-health.service';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [TerminusModule, HashModule],
  controllers: [GatewayHealthController],
  providers: [GatewayHealthService],
})
export class GatewayHealthModule {}
