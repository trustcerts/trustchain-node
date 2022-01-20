import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { EventClientModule } from '@tc/event-client';
import { GatewayBlockchainController } from './gateway-blockchain.controller';
import { GatewayBlockchainService } from './gateway-blockchain.service';
import { HashModule } from '@tc/blockchain/hashModule';
import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
    HashModule,
    DidIdCachedModule,
    EventClientModule,
  ],
  providers: [
    GatewayBlockchainService,
    makeGaugeProvider({
      name: 'gateway_transactionPool',
      help: 'shows the current transaction pool in gateway',
    }),
  ],
  controllers: [GatewayBlockchainController],
  exports: [GatewayBlockchainService, HashModule],
})
export class GatewayBlockchainModule {}
