import { EventClientModule } from 'libs/clients/event-client/src';
import { InviteModule } from '@tc/invite/invite.module';
import { Module } from '@nestjs/common';
import { NetworkClientModule } from 'libs/clients/network-client/src';
import { PersistClientModule } from 'libs/clients/persist-client/src';
import { ValidatorBlockchainModule } from '../validator-blockchain/validator-blockchain.module';
import { ValidatorDidController } from './validator-did.controller';
import { ValidatorDidService } from './validator-did.service';
import { WalletClientModule } from 'libs/clients/wallet-client/src';

import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { GenesisController } from './genesis/genesis.controller';

@Module({
  imports: [
    EventClientModule,
    NetworkClientModule,
    DidCachedModule,
    PersistClientModule,
    ValidatorBlockchainModule,
    DidCachedModule,
    WalletClientModule,
    InviteModule,
  ],
  controllers: [ValidatorDidController, GenesisController],
  providers: [ValidatorDidService],
  exports: [ValidatorDidService, InviteModule],
})
export class ValidatorDidModule {}
