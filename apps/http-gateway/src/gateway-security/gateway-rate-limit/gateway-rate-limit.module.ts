import { GatewayBlockchainModule } from '../../gateway-blockchain/gateway-blockchain.module';
import { GatewayRateLimitService } from './gateway-rate-limit.service';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { RateLimitCachedModule } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.module';
import { RateLimitController } from './rate-limit.controller';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    HashCachedModule,
    WalletClientModule,
    HashModule,
    GatewayBlockchainModule,
    RateLimitCachedModule,
  ],
  controllers: [RateLimitController],
  providers: [GatewayRateLimitService],
})
export class GatewayRateLimitModule {}
