import { BlockReceivedService } from './block-received.service';
import { EventClientModule } from '@tc/event-client';
import { Module } from '@nestjs/common';
import { BlockReceivedController } from './block-received.controller';

@Module({
  imports: [EventClientModule],
  providers: [BlockReceivedService],
  exports: [BlockReceivedService],
  controllers: [BlockReceivedController],
})
export class BlockReceivedModule {}
