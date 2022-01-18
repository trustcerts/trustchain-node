import { GatewayBlockchainModule } from '../gateway-blockchain/gateway-blockchain.module';
import { GatewaySchemaController } from './gateway-schema.controller';
import { GatewaySchemaService } from './gateway-schema.service';
import { Module } from '@nestjs/common';
import { SchemaBlockchainModule } from '@tc/schema/schema-blockchain/schema-blockchain.module';
import { SchemaCachedModule } from '@tc/schema/schema-cached/schema-cached.module';
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
