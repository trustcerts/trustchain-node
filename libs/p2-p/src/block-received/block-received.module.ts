import { BlockReceivedService } from './block-received.service';
import { Module } from '@nestjs/common';
import { ParseClientModule } from '@tc/clients/parse-client';
import { PersistClientModule } from '@tc/clients/persist-client/persist-client.module';

@Module({
  imports: [PersistClientModule, ParseClientModule],
  providers: [BlockReceivedService],
  exports: [BlockReceivedService],
  controllers: [],
})
export class BlockReceivedModule {}
