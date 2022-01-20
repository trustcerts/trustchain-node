import { HandshakeService } from '@tc/p2-p/handshake/handshake.service';
import { Module } from '@nestjs/common';
import { P2PController } from './p2-p.controller';
import { P2PService } from './p2-p.service';

import { BlockReceivedModule } from './block-received/block-received.module';
import { BlockchainSyncModule } from '@tc/p2-p/blockchain-sync/blockchain-sync.module';
import { ConfigModule } from '@tc/config';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { PersistClientModule } from '@tc/persist-client';
import { SignatureModule } from '@tc/blockchain/signature/signature.module';
import { WalletClientModule } from '@tc/wallet-client';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    SignatureModule,
    BlockchainSyncModule,
    DidIdCachedModule,
    WalletClientModule,
    PersistClientModule,
    BlockReceivedModule,
  ],
  providers: [
    P2PService,
    HandshakeService,
    makeGaugeProvider({
      name: 'connections',
      labelNames: ['node', 'type', 'peer'],
      help: 'information to a connected node',
    }),
  ],
  exports: [P2PService, HandshakeService],
  controllers: [P2PController],
})
export class P2PModule {}
