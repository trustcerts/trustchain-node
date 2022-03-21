import { ConfigService } from '@tc/config';
import { DidTemplateResolver } from '@trustcerts/template-verify';
import { GatewayBlockchainService } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '@apps/http-gateway/src/gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { TemplateCachedService } from '@tc/transactions/did-template/cached/template-cached.service';
import { TemplateTransactionCheckService } from '@tc/transactions/did-template/validation/template-transaction-check.service';
import { TemplateTransactionDto } from '@tc/transactions/did-template/dto/template.transaction.dto';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service to handle incoming templates.
 */
@Injectable()
export class GatewayTemplateService extends GatewayTransactionService {
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
    protected readonly templateTransactionCheckSerice: TemplateTransactionCheckService,
    protected readonly templateCachedService: TemplateCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      templateTransactionCheckSerice,
      templateCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidTemplateResolver();
  }

  /**
   * Persist a template for vc.
   * @param transaction
   */
  async addTemplate(transaction: TemplateTransactionDto) {
    await this.addDidDocSignature(transaction);
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
