import { DidIdBlockchainModule } from '@tc/did-id/did-id-blockchain/did-id-blockchain.module';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayDidController } from './gateway-did.controller';
import { GatewayDidService } from './gateway-did.service';
import { InviteModule } from '@tc/invite';
import { Module } from '@nestjs/common';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    DidIdBlockchainModule,
    DidIdCachedModule,
    WalletClientModule,
    InviteModule,
  ],
  controllers: [GatewayDidController],
  providers: [GatewayDidService],
})
export class GatewayDidModule {}
