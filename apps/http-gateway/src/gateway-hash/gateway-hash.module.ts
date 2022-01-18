import { ConfigModule } from '@tc/config';
import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewayHashController } from './gateway-hash.controller';
import { GatewayHashService } from './gateway-hash.service';
import { HashBlockchainModule } from '@tc/hash/hash-blockchain/hash-blockchain.module';
import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { HttpConfigService } from '@shared/http-config.service';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { WalletClientModule } from '@tc/wallet-client';

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
    DidCachedModule,
  ],
  controllers: [GatewayHashController],
  providers: [GatewayHashService],
})
export class GatewayHashModule {}
