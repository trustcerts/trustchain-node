import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { PersistClientModule } from '@tc/persist-client';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    HashModule,
    DidIdCachedModule,
    WalletClientModule,
    PersistClientModule,
  ],
  providers: [BlockCheckService],
  exports: [BlockCheckService, DidIdCachedModule],
})
export class BlockCheckModule {}
