import { ConfigService } from '@tc/config';
import { DidSchemaResolver } from '@trustcerts/schema-verify';
import { GatewayBlockchainService } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '@apps/http-gateway/src/gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { SchemaCachedService } from '@tc/did-schema/cached/schema-cached.service';
import { SchemaTransactionCheckService } from '@tc/did-schema/validation/schema-transaction-check.service';
import { SchemaTransactionDto } from '@tc/did-schema/dto/schema.transaction.dto';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service to handle incoming schemas.
 */
@Injectable()
export class GatewaySchemaService extends GatewayTransactionService {
  /**
   * Loads required services.
   * @param gatewayBlockchainService
   * @param didCachedService
   * @param walletService
   * @param hashService
   * @param configService
   * @param logger
   */
  constructor(
    protected readonly gatewayBlockchainService: GatewayBlockchainService,
    protected readonly schemaTransactionCheckService: SchemaTransactionCheckService,
    protected readonly schemaCachedService: SchemaCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      schemaTransactionCheckService,
      schemaCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidSchemaResolver();
  }

  /**
   * Persist a schema for vc.
   * @param transaction
   */
  async addSchema(transaction: SchemaTransactionDto) {
    await this.addDidDocSignature(transaction);
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
