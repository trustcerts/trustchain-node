import { ConfigService } from '@tc/config';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Logger } from 'winston';
import { TemplateCachedService } from '@tc/template/template-cached/template-cached.service';
import { TemplateTransactionDto } from '@tc/template/dto/template.transaction.dto';
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
    protected readonly templateCachedService: TemplateCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      templateCachedService,
      walletService,
      logger,
      configService,
    );
  }

  /**
   * Persist a template for vc.
   * @param transaction
   */
  async addTemplate(transaction: TemplateTransactionDto) {
    const template = await this.templateCachedService.getTemplate(
      transaction.body.value.id,
    );
    if (template) {
      throw new ConflictException('id already taken');
    }
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
