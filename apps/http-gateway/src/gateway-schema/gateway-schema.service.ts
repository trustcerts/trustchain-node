import { ConfigService } from '@tc/config';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { SchemaCachedService } from '@tc/schema/schema-cached/schema-cached.service';
import { SchemaTransaction } from '@tc/schema/dto/schema.transaction.dto';
import { SchemaTransactionCheckService } from '@tc/schema/schema-blockchain/schema-transaction-check/schema-transaction-check.service';
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
  }

  /**
   * Persist a schema for vc.
   * @param transaction
   */
  async addSchema(transaction: SchemaTransaction) {
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
