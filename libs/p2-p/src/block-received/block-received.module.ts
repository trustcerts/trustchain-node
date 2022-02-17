import { BlockReceivedService } from './block-received.service';
import { Module } from '@nestjs/common';
import { ParseClientModule } from '@tc/parse-client';
import { PersistClientModule } from '@tc/persist-client/persist-client.module';

@Module({
  imports: [PersistClientModule, ParseClientModule],
  providers: [BlockReceivedService],
  exports: [BlockReceivedService],
  controllers: [],
})
export class BlockReceivedModule {}
