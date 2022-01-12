import { CachedService } from '@shared/cache.service';
import { ConfigService } from '@tc/config';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { SecurityTransactionDto } from '@tc/security/security.transaction.dto';
import { WalletClientService } from 'libs/clients/wallet-client/src';

/**
 * Base Service to add a security transaction.
 */
export class GatewaySecurityService extends GatewayTransactionService {
  /**
   * Injects required services.
   * @param gatewayBlockchainService
   * @param logger
   */
  constructor(
    protected readonly gatewayBlockchainService: GatewayBlockchainService,
    protected readonly cachedService: CachedService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      cachedService,
      walletService,
      logger,
      configService,
    );
  }

  /**
   * Creates a transaction based on if a cert should be created or revoked. Transaction is passed to the blockchain service where it will be
   * broadcasted and return the cert's hash.
   * @param transaction
   */
  public createSecurityTransaction(
    transaction: SecurityTransactionDto,
  ): Promise<any> {
    return this.addTransaction(transaction);
  }
}
