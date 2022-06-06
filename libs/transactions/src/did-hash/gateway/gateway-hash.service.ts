import { ConfigService } from '@tc/config';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DidHashResolver } from '@trustcerts/did-hash';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { GatewayBlockchainService } from '@apps/http-gateway/src/gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '@apps/http-gateway/src/gateway-transaction.service';
import { HashCachedService } from '@tc/transactions/did-hash/cached/hash-cached.service';
import { HashDidTransactionDto } from '@tc/transactions/did-hash/dto/hash-transaction.dto';
import { HashResponse } from '../dto/hash-respnse.dto';
import { HashService } from '@tc/blockchain/hash.service';
import { HashTransactionCheckService } from '@tc/transactions/did-hash/validation/hash-transaction-check.service';
import { Logger } from 'winston';
import { WalletClientService } from '@tc/clients/wallet-client';

/**
 * Service to validate requests from the api to the blockchain level.
 */
@Injectable()
export class GatewayHashService extends GatewayTransactionService<DidHashResolver> {
  /**
   * Loads required services.
   * @param gatewayBlockchainService
   * @param hashCachedService
   * @param hashService
   * @param hashService
   * @param didCachedService
   * @param logger
   */
  constructor(
    protected readonly gatewayBlockchainService: GatewayBlockchainService,
    protected readonly hashTransactionCheck: HashTransactionCheckService,
    private readonly hashCachedService: HashCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    protected readonly configService: ConfigService,
    private readonly didCachedService: DidIdCachedService,
    @Inject('winston') protected readonly logger: Logger,
  ) {
    super(
      gatewayBlockchainService,
      hashTransactionCheck,
      hashCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidHashResolver();
  }

  /**
   * Passes a transaction to the blockchain service if there isn't already one hash with the same hash.
   * @param transaction
   */
  async addHash(transaction: HashDidTransactionDto): Promise<HashResponse> {
    const hash = await this.hashCachedService.getHash(
      transaction.body.value.id,
    );
    if (hash) {
      throw new ConflictException(
        `hash already signed: ${transaction.body.value.id}`,
      );
    }
    await this.addDidDocSignature(transaction);

    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }

  /**
   * Passes the transaction to the blockchain service if validation is passing:
   * - Hash already exists
   * - Hash isn't revoked yet
   * - Client that wants to revoke the hash created it
   * @param transaction
   */
  async revokeHash(transaction: HashDidTransactionDto): Promise<HashResponse> {
    // TODO move checks into transaction check
    const hash = await this.hashCachedService.getHash(
      transaction.body.value.id,
    );
    if (!hash) {
      throw new ConflictException(`Hash to revoke doesn't exist.`);
    }
    if (hash.revoked !== undefined) {
      throw new ConflictException('Hash already revoked.');
    }

    const idSignature = this.didCachedService.getIdentifierOfKey(
      transaction.signature.values[0].identifier,
    );

    await this.cachedService.canChange(idSignature, hash.id).catch((err) => {
      this.logger.error(err);
      throw new ConflictException(
        'Only the original issuer can revoke the hash.',
      );
    });

    await this.addDidDocSignature(transaction);

    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
