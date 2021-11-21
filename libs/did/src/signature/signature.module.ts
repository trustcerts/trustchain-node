import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { Module } from '@nestjs/common';
import { SignatureService } from '@tc/did/signature/signature.service';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [DidCachedModule, WalletClientModule],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
