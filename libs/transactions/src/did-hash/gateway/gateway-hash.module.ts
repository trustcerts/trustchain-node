import { ConfigModule } from '@tc/config';
import { DidIdCachedModule } from '@tc/transactions/did-id/cached/did-id-cached.module';
import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewayHashController } from './gateway-hash.controller';
import { GatewayHashService } from './gateway-hash.service';
import { HashBlockchainModule } from '@tc/transactions/did-hash/validation/hash-blockchain.module';
import { HashCachedModule } from '@tc/transactions/did-hash/cached/hash-cached.module';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WalletClientModule } from '@tc/clients/wallet-client';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useClass: HttpConfigService,
    }),
    WalletClientModule,
    GatewayBlockchainModule,
    HashCachedModule,
    HashBlockchainModule,
    DidIdCachedModule,
  ],
  controllers: [GatewayHashController],
  providers: [GatewayHashService],
})
export class GatewayHashModule {}
