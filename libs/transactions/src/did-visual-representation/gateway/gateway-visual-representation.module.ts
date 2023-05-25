import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewayVisualRepresentationController } from './gateway-visual-representation.controller';
import { GatewayVisualRepresentationService } from './gateway-visual-representation.service';
import { Module } from '@nestjs/common';
import { VisualRepresentationBlockchainModule } from '../validation/visual-representation-blockchain.module';
import { VisualRepresentationCachedModule } from '../cached/visual-representation-cached.module';
import { WalletClientModule } from '@tc/clients/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    VisualRepresentationCachedModule,
    VisualRepresentationBlockchainModule,
    WalletClientModule,
  ],
  controllers: [GatewayVisualRepresentationController],
  providers: [GatewayVisualRepresentationService],
})
export class GatewayVisualRepresentationModule {}
