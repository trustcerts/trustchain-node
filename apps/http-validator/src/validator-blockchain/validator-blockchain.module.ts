import { EventClientModule } from 'libs/clients/event-client/src';
import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { ValidatorBlockchainController } from './validator-blockchain.controller';
import { ValidatorBlockchainService } from './validator-blockchain.service';

@Module({
  imports: [HashModule, EventClientModule],
  controllers: [ValidatorBlockchainController],
  providers: [ValidatorBlockchainService],
  exports: [ValidatorBlockchainService, HashModule],
})
export class ValidatorBlockchainModule {}
