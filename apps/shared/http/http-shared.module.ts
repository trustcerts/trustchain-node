import { EventClientModule } from '@tc/event-client';
import { Module } from '@nestjs/common';
import { NetworkClientModule } from '@tc/network-client';
import { ParseClientModule } from '@tc/parse-client';
import { PersistClientModule } from '@tc/persist-client';
import { WalletClientModule } from '@tc/wallet-client';

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
