import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewaySchemaController } from './gateway-schema.controller';
import { GatewaySchemaService } from './gateway-schema.service';
import { Module } from '@nestjs/common';
import { SchemaBlockchainModule } from '@tc/transactions/did-schema/validation/schema-blockchain.module';
import { SchemaCachedModule } from '@tc/transactions/did-schema/cached/schema-cached.module';
import { WalletClientModule } from '@tc/clients/wallet-client';

@Module({
  imports: [
    GatewayBlockchainModule,
    SchemaCachedModule,
    SchemaBlockchainModule,
    WalletClientModule,
  ],
  controllers: [GatewaySchemaController],
  providers: [GatewaySchemaService],
})
export class GatewaySchemaModule {}
