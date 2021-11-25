import { GatewayRateLimitModule } from './gateway-rate-limit/gateway-rate-limit.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GatewayRateLimitModule],
})
export class GatewaySecurityModule {}
