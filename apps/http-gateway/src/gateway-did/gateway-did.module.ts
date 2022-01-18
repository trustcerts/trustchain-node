import { DidBlockchainModule } from '@tc/did/did-blockchain/did-blockchain.module';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayDidController } from './gateway-did.controller';
import { GatewayDidService } from './gateway-did.service';
import { InviteModule } from '@tc/invite';
import { Module } from '@nestjs/common';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    DidBlockchainModule,
    DidCachedModule,
    WalletClientModule,
    InviteModule,
  ],
  controllers: [GatewayDidController],
  providers: [GatewayDidService],
})
export class GatewayDidModule {}
