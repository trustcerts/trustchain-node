import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { WalletClientModule } from '@tc/clients/wallet-client';

@Module({
  imports: [DidIdCachedModule, WalletClientModule],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
