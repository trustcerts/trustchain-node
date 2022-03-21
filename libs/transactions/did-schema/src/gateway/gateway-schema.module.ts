import { GatewayBlockchainModule } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.module';
import { GatewaySchemaController } from './gateway-schema.controller';
import { GatewaySchemaService } from './gateway-schema.service';
import { Module } from '@nestjs/common';
import { SchemaBlockchainModule } from '@tc/did-schema/validation/schema-blockchain.module';
import { SchemaCachedModule } from '@tc/did-schema/cached/schema-cached.module';
import { WalletClientModule } from '@tc/wallet-client';

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
