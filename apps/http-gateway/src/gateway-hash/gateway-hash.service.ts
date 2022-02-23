import { ConfigService } from '@tc/config';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashCreationResponse, HashRevocationResponse } from './response';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';
import { HashService } from '@tc/blockchain/hash.service';
import { Logger } from 'winston';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service to validate requests from the api to the blockchain level.
 */
@Injectable()
export class GatewayHashService extends GatewayTransactionService {
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
    private readonly hashCachedService: HashCachedService,
    protected readonly hashService: HashService,
    protected readonly walletService: WalletClientService,
    private readonly didCachedService: DidCachedService,
    protected readonly configService: ConfigService,
    @Inject('winston') protected readonly logger: Logger,
  ) {
    super(
      gatewayBlockchainService,
      hashCachedService,
      walletService,
      logger,
      configService,
    );
  }

  /**
   * Passes a transaction to the blockchain service if there isn't already one hash with the same hash.
   * @param transaction
   */
  async addHash(
    transaction: HashCreationTransactionDto,
  ): Promise<HashCreationResponse> {
    const hash = await this.hashCachedService.getHash(
      transaction.body.value.hash,
    );
    if (hash) {
      throw new ConflictException(
        `hash already signed: ${transaction.body.value.hash}`,
      );
    }
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
  async revokeHash(
    transaction: HashRevocationTransactionDto,
  ): Promise<HashRevocationResponse> {
    const hash = await this.hashCachedService.getHash(
      transaction.body.value.hash,
    );
    if (!hash) {
      throw new ConflictException(`Hash to revoke doesn't exist.`);
    }
    if (hash.revokedAt !== undefined) {
      throw new ConflictException('Hash already revoked.');
    }

    const idSignature = this.didCachedService.getIdentifierOfKey(
      transaction.signature.values[0].identifier,
    );

    const idHash = this.didCachedService.getIdentifierOfKey(
      hash.signature[0].identifier,
    );

    if (idSignature !== idHash) {
      throw new ConflictException(
        'Only the original issuer can revoke the hash.',
      );
    }
    return {
      metaData: await this.addTransaction(transaction),
      transaction,
    };
  }
}
