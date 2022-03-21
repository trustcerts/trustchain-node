import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewayTemplateController } from './gateway-template.controller';
import { GatewayTemplateService } from './gateway-template.service';
import { Module } from '@nestjs/common';
import { TemplateBlockchainModule } from '../validation/template-blockchain.module';
import { TemplateCachedModule } from '../cached/template-cached.module';
import { WalletClientModule } from '@tc/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    TemplateCachedModule,
    TemplateBlockchainModule,
    WalletClientModule,
  ],
  controllers: [GatewayTemplateController],
  providers: [GatewayTemplateService],
})
export class GatewayTemplateModule {}
