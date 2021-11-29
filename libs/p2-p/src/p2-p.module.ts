import { HandshakeService } from '@tc/p2-p/handshake/handshake.service';
import { Module } from '@nestjs/common';
import { P2PController } from './p2-p.controller';
import { P2PService } from './p2-p.service';

import { BlockchainSyncModule } from '@tc/p2-p/blockchain-sync/blockchain-sync.module';
import { ConfigModule, ConfigService } from '@tc/config';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { NetworkModule } from '@tc/network';
import { PersistClientModule } from '@tc/persist-client';
import { SignatureModule } from '@tc/did/signature/signature.module';
import { WalletClientModule, WalletClientService } from '@tc/wallet-client';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    SignatureModule,
    BlockchainSyncModule,
    DidCachedModule,
    WalletClientModule,
    PersistClientModule,
    NetworkModule,
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
export class P2PModule {
  constructor(
    private readonly configService: ConfigService,
    private walletClientService: WalletClientService,
  ) {
    // // ask for the identifier if the own config is not present anymore.
    // if (!this.configService.getConfig('IDENTIFIER')) {
    //   this.walletClientService
    //     .getOwnInformation()
    //     .then((id) => this.configService.setConfig('IDENTIFIER', id));
    // }
  }
}