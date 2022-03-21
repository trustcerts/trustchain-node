import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { PersistClientModule } from '@tc/clients/persist-client';
import { WalletClientModule } from '@tc/clients/wallet-client';

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
