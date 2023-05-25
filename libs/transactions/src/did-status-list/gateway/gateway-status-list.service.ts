import { ConfigService } from '@tc/config';
import { DidStatusListResolver } from '@trustcerts/did-status-list';
import { GatewayBlockchainService } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '@apps/http-gateway/src/gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { StatusListCachedService } from '@tc/transactions/did-status-list/cached/status-list-cached.service';
import { StatusListTransactionCheckService } from '@tc/transactions/did-status-list/validation/status-list-transaction-check.service';
import { StatusListTransactionDto } from '@tc/transactions/did-status-list/dto/status-list.transaction.dto';
import { WalletClientService } from '@tc/clients/wallet-client';

/**
 * Service to handle incoming statuslists.
 */
@Injectable()
export class GatewayStatusListService extends GatewayTransactionService<DidStatusListResolver> {
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
    protected readonly statuslistTransactionCheckSerice: StatusListTransactionCheckService,
    protected readonly statuslistCachedService: StatusListCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      statuslistTransactionCheckSerice,
      statuslistCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidStatusListResolver();
  }

  /**
   * Persist a statuslist for vc.
   * @param transaction
   */
  async addStatusList(transaction: StatusListTransactionDto) {
    await this.addDidDocSignature(transaction).catch((err) => {
      console.log(err);
    });
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
