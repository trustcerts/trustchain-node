import { EventClientModule } from '@tc/clients/event-client';
import { InviteModule } from '@tc/invite/invite.module';
import { Module } from '@nestjs/common';
import { NetworkClientModule } from '@tc/clients/network-client';
import { PersistClientModule } from '@tc/clients/persist-client';
import { ValidatorBlockchainModule } from '../validator-blockchain/validator-blockchain.module';
import { ValidatorDidController } from './validator-did.controller';
import { ValidatorDidService } from './validator-did.service';
import { WalletClientModule } from '@tc/clients/wallet-client';

import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { GenesisController } from './genesis/genesis.controller';

@Module({
  imports: [
    EventClientModule,
    NetworkClientModule,
    DidIdCachedModule,
    PersistClientModule,
    ValidatorBlockchainModule,
    DidIdCachedModule,
    WalletClientModule,
    InviteModule,
  ],
  controllers: [ValidatorDidController, GenesisController],
  providers: [ValidatorDidService],
  exports: [ValidatorDidService, InviteModule],
})
export class ValidatorDidModule {}
