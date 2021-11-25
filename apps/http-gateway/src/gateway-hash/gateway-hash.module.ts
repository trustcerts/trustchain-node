import { ConfigModule } from '@tc/config';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayHashController } from './gateway-hash.controller';
import { GatewayHashService } from './gateway-hash.service';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HttpConfigService } from '../../../shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RateLimitCachedModule } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.module';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    WalletClientModule,
    GatewayBlockchainModule,
    HashCachedModule,
    DidCachedModule,
    // Import security module to protect hash routes
    RateLimitCachedModule,
  ],
  controllers: [GatewayHashController],
  providers: [GatewayHashService],
})
export class GatewayHashModule {}
