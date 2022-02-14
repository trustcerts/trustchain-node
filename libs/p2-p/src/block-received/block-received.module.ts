import { BlockReceivedController } from './block-received.controller';
import { BlockReceivedService } from './block-received.service';
import { EventClientModule } from '@tc/event-client';
import { Module } from '@nestjs/common';
import { PersistClientModule } from '@tc/persist-client/persist-client.module';

@Module({
  imports: [EventClientModule, PersistClientModule],
  providers: [BlockReceivedService],
  exports: [BlockReceivedService],
  controllers: [BlockReceivedController],
})
export class BlockReceivedModule {}
