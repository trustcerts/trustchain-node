import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { PersistClientModule } from '@tc/persist-client';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    HashModule,
    DidCachedModule,
    WalletClientModule,
    PersistClientModule,
  ],
  providers: [BlockCheckService],
  exports: [BlockCheckService],
})
export class BlockCheckModule {}
