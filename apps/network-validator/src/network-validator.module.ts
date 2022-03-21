import * as Joi from 'joi';
import { ConfigModule, ConfigService } from '@tc/config';
import { GenesisController } from './root-cert/genesis.controller';
import { GenesisService } from './root-cert/genesis.service';
import { Module } from '@nestjs/common';
import { NetworkValidatorController } from './network-validator.controller';
import { NetworkValidatorService } from './network-validator.service';
import { P2PModule } from '@tc/p2-p';
import { ParseClientModule } from '@tc/clients/parse-client';
import { PersistClientModule } from '@tc/clients/persist-client';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { ValidatorBlockchainModule } from './validator-blockchain/validator-blockchain.module';
import { ValidatorConsensusModule } from './validator-blockchain/validator-consensus/validator-consensus.module';
import { ValidatorHealthModule } from './validator-health/validator-health.module';
import { WalletClientModule } from '@tc/clients/wallet-client';
import { WinstonModule } from 'nest-winston';
import {
  dbConnectionValidation,
  networkDynamicValidation,
  networkValidation,
} from '@shared/validation-rules';

import { BlockReceivedModule } from '@tc/p2-p/block-received/block-received.module';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { DidIdDbModule } from '@tc/transactions/did-id/db/did-id-db.module';
import { EventClientModule } from '@tc/clients/event-client';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Identifier } from '@trustcerts/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      service: 'network',
      environment: {
        OWN_PEER: Joi.string(),
        DID: Joi.optional(),
        CONSENSUS_WAIT_INIT: Joi.number().default(5),
        IS_VALIDATOR: Joi.boolean().default(true),
        VALIDATOR_MIN: Joi.number().default(2),
        BLOCK_SIZE: Joi.number().default(100),
        HTTP_ENDPOINT: Joi.string(),
        DID_NETWORK: Joi.string(),
        VIRTUAL_HOST: Joi.string(),
        ...networkValidation,
        ...dbConnectionValidation,
      },
      dynamic: {
        ...networkDynamicValidation,
      },
    }),
    P2PModule,
    WinstonModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transports: configService.getLoggingTransports(),
      }),
      inject: [ConfigService],
    }),
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    ValidatorHealthModule,
    ValidatorBlockchainModule,
    ValidatorConsensusModule,
    BlockReceivedModule,
    EventClientModule,
    WalletClientModule,
    PersistClientModule,
    ParseClientModule,

    DidIdCachedModule,
    DidIdDbModule,
  ],
  controllers: [NetworkValidatorController, GenesisController],
  providers: [NetworkValidatorService, GenesisService],
})
export class NetworkValidatorModule {
  constructor(configService: ConfigService) {
    Identifier.setNetwork(configService.getString('DID_NETWORK'));
  }
}
