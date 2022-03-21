import { DidIdCachedModule } from '@tc/did-id/cached/did-id-cached.module';
import { Module } from '@nestjs/common';
import { SignatureService } from './signature.service';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [DidIdCachedModule, WalletClientModule],
  providers: [SignatureService],
  exports: [SignatureService],
})
export class SignatureModule {}
