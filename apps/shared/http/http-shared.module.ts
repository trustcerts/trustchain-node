import { EventClientModule } from '@tc/clients/event-client';
import { Module } from '@nestjs/common';
import { NetworkClientModule } from '@tc/clients/network-client';
import { ParseClientModule } from '@tc/clients/parse-client';
import { PersistClientModule } from '@tc/clients/persist-client';
import { WalletClientModule } from '@tc/clients/wallet-client';

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
