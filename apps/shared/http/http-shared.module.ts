import { EventClientModule } from 'libs/clients/event-client/src';
import { Module } from '@nestjs/common';
import { NetworkClientModule } from 'libs/clients/network-client/src';
import { ParseClientModule } from 'libs/clients/parse-client/src';
import { PersistClientModule } from 'libs/clients/persist-client/src';
import { WalletClientModule } from 'libs/clients/wallet-client/src';

@Module({
  imports: [
    PersistClientModule,
    ParseClientModule,
    NetworkClientModule,
    WalletClientModule,
    EventClientModule,
  ],
  exports: [
    PersistClientModule,
    ParseClientModule,
    NetworkClientModule,
    WalletClientModule,
    EventClientModule,
  ],
})
export class HttpSharedModule {}
