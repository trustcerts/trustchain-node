import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayTemplateController } from './gateway-template.controller';
import { GatewayTemplateService } from './gateway-template.service';
import { Module } from '@nestjs/common';
import { TemplateCachedModule } from '@tc/template/template-cached/template-cached.module';
import { WalletClientModule } from 'libs/clients/wallet-client/src';

@Module({
  imports: [GatewayBlockchainModule, TemplateCachedModule, WalletClientModule],
  controllers: [GatewayTemplateController],
  providers: [GatewayTemplateService],
})
export class GatewayTemplateModule {}
