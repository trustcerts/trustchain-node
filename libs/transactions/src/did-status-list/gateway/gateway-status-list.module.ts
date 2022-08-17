import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewayStatusListController } from './gateway-status-list.controller';
import { GatewayStatusListService } from './gateway-status-list.service';
import { Module } from '@nestjs/common';
import { StatusListBlockchainModule } from '../validation/status-list-blockchain.module';
import { StatusListCachedModule } from '../cached/status-list-cached.module';
import { WalletClientModule } from '@tc/clients/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    StatusListCachedModule,
    StatusListBlockchainModule,
    WalletClientModule,
  ],
  controllers: [GatewayStatusListController],
  providers: [GatewayStatusListService],
})
export class GatewayStatusListModule {}
