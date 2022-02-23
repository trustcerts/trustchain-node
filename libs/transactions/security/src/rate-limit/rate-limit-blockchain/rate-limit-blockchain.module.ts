import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { RateLimitCachedModule } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.module';
import { RateLimitTransactionCheckService } from './rate-limit-transaction-check/rate-limit-transaction-check.service';
import { SecurityDbModule } from '@tc/security/security-db/security-db.module';

@Module({
  imports: [
    SecurityDbModule,
    HashModule,
    BlockCheckModule,
    RateLimitCachedModule,
    DidCachedModule,
  ],
  providers: [RateLimitTransactionCheckService],
})
export class RateLimitBlockchainModule {}
