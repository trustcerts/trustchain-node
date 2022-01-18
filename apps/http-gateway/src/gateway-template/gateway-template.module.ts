import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayTemplateController } from './gateway-template.controller';
import { GatewayTemplateService } from './gateway-template.service';
import { Module } from '@nestjs/common';
import { TemplateBlockchainModule } from '@tc/template/template-blockchain/template-blockchain.module';
import { TemplateCachedModule } from '@tc/template/template-cached/template-cached.module';
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
