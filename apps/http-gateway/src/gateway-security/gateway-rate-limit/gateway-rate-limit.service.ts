import { ConfigService } from '@tc/config';
import { GatewayBlockchainService } from '../../gateway-blockchain/gateway-blockchain.service';
import { GatewaySecurityService } from '../gateway-security.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { RateLimitCachedService } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.service';
import { SecurityLimitTransactionDto } from '@tc/security/rate-limit/dto/security-limit.transaction.dto';
import { SignatureType } from '@tc/blockchain/transaction/transaction.dto';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service that generate a transaction to limit the amount of transactions a user is allowed to make.
 */
@Injectable()
export class GatewayRateLimitService extends GatewaySecurityService {
  /**
   * Imports required services.
   * @param gatewayBlockchainService
   * @param walletService
   * @param rateLimitCachedService
   * @param hashService
   * @param logger
   */
  constructor(
    gatewayBlockchainService: GatewayBlockchainService,
    protected readonly walletService: WalletClientService,
    protected readonly rateLimitCachedService: RateLimitCachedService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      rateLimitCachedService,
      walletService,
      logger,
      configService,
    );
  }

  /**
   * Sets a new limit the a Client's security rule.
   * @param identifier
   * @param limit
   */
  async setLimit(identifier: string, limit: number) {
    const transaction = new SecurityLimitTransactionDto({
      identifier,
      amount: limit,
    });
    transaction.signature = {
      type: SignatureType.single,
      values: [
        await this.walletService.signIssuer(
          this.rateLimitCachedService.getValues(transaction),
        ),
      ],
    };
    return this.createSecurityTransaction(transaction);
  }
}
