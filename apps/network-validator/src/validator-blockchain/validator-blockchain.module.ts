import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { BlockReceivedModule } from '@tc/p2-p/block-received/block-received.module';
import { BlockchainGateway } from './blockchain.gateway';
import { ConfigModule } from '@tc/config';
import { DidIdBlockchainModule } from '@tc/did-id/did-id-blockchain/did-id-blockchain.module';
import { EventClientModule } from '@tc/event-client';
import { HashBlockchainModule } from '@tc/hash/hash-blockchain/hash-blockchain.module';
import { HashModule } from '@tc/blockchain';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { P2PModule } from '@tc/p2-p';
import { TemplateBlockchainModule } from '@tc/template/template-blockchain/template-blockchain.module';
import { ValidatorBlockchainService } from './validator-blockchain.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    HashModule,
    HashBlockchainModule,
    DidIdBlockchainModule,
    TemplateBlockchainModule,
    P2PModule,
    BlockCheckModule,
    EventClientModule,
    BlockReceivedModule,
  ],
  providers: [BlockchainGateway, ValidatorBlockchainService],
  exports: [ValidatorBlockchainService, HashModule],
})
export class ValidatorBlockchainModule {}
