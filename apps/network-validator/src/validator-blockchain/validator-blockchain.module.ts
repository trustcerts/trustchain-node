import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { BlockchainGateway } from './blockchain.gateway';
import { ConfigModule } from '@tc/config';
import { DidBlockchainModule } from '@tc/did/did-blockchain/did-blockchain.module';
import { EventClientModule } from 'libs/clients/event-client/src';
import { HashBlockchainModule } from '@tc/hash/hash-blockchain/hash-blockchain.module';
import { HashModule } from '@tc/blockchain';
import { HttpConfigService } from '../../../shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NetworkModule } from '@tc/network';
import { P2PModule } from '@tc/p2-p';
import { RateLimitBlockchainModule } from '@tc/security/rate-limit/rate-limit-blockchain/rate-limit-blockchain.module';
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
    RateLimitBlockchainModule,
    DidBlockchainModule,
    TemplateBlockchainModule,
    P2PModule,
    BlockCheckModule,
    EventClientModule,
    NetworkModule,
  ],
  providers: [BlockchainGateway, ValidatorBlockchainService],
  exports: [ValidatorBlockchainService, HashModule],
})
export class ValidatorBlockchainModule {}
