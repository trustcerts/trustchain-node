import { BlockCheckModule } from '@tc/blockchain/block-check/block-check.module';
import { ConsensusHealthIndicator } from './consensus.health';
import { DidIdCachedModule } from '@tc/did-id/did-id-cached/did-id-cached.module';
import { Module } from '@nestjs/common';
import { P2PModule } from '@tc/p2-p';
import { PersistClientModule } from '@tc/persist-client/persist-client.module';
import { ProposerService } from './proposer/proposer.service';
import { SignatureModule } from '@tc/blockchain/signature/signature.module';
import { ValidatorBlockchainModule } from '../validator-blockchain.module';
import { ValidatorConsensusService } from './validator-consensus.service';
import { ValidatorService } from './validator/validator.service';
import { WalletClientModule } from '@tc/wallet-client/wallet-client.module';
import { makeGaugeProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    ValidatorBlockchainModule,
    SignatureModule,
    DidIdCachedModule,
    PersistClientModule,
    BlockCheckModule,
    WalletClientModule,
    P2PModule,
  ],
  providers: [
    ValidatorConsensusService,
    ConsensusHealthIndicator,
    ValidatorService,
    ProposerService,
    makeGaugeProvider({
      name: 'validator_min',
      help: 'minimum amount of validators to start the consensus.',
    }),
    makeGaugeProvider({
      name: 'validator_max',
      help: 'maximum amount of validators that can take part in the consensus.',
    }),
  ],
  exports: [
    ConsensusHealthIndicator,
    ValidatorBlockchainModule,
    ValidatorConsensusService,
  ],
})
export class ValidatorConsensusModule {}
