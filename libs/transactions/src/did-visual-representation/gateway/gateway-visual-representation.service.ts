import { ConfigService } from '@tc/config';
import { DidVisualRepresentationResolver } from '@trustcerts/did-visual-representation';
import { GatewayBlockchainService } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '@apps/http-gateway/src/gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { VisualRepresentationCachedService } from '@tc/transactions/did-visual-representation/cached/visual-representation-cached.service';
import { VisualRepresentationTransactionCheckService } from '@tc/transactions/did-visual-representation/validation/visual-representation-transaction-check.service';
import { VisualRepresentationTransactionDto } from '@tc/transactions/did-visual-representation/dto/visual-representation.transaction.dto';
import { WalletClientService } from '@tc/clients/wallet-client';

/**
 * Service to handle incoming visualrepresentations.
 */
@Injectable()
export class GatewayVisualRepresentationService extends GatewayTransactionService<any> {
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
    protected readonly visualrepresentationTransactionCheckSerice: VisualRepresentationTransactionCheckService,
    protected readonly visualrepresentationCachedService: VisualRepresentationCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    @Inject('winston') protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {
    super(
      gatewayBlockchainService,
      visualrepresentationTransactionCheckSerice,
      visualrepresentationCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidVisualRepresentationResolver();
  }

  /**
   * Persist a visualrepresentation for vc.
   * @param transaction
   */
  async addVisualRepresentation(
    transaction: VisualRepresentationTransactionDto,
  ) {
    await this.addDidDocSignature(transaction);
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
