import { ConfigService } from '@tc/config';
import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDidTransactionDto } from '@tc/hash/dto/hash-transaction.dto';
import { HashResponse } from './dto/hash.respnse';
import { HashService } from '@tc/blockchain/hash.service';
import { HashTransactionCheckService } from '@tc/hash/hash-blockchain/hash-transaction-check/hash-transaction-check.service';
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
