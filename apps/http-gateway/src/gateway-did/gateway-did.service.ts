import { ConfigService } from '@tc/config';
import { CreateDidIdDto } from '@tc/did-id/dto/create-did-id.dto';
import { DidCreationResponse } from './responses';
import {
  DidId,
  DidIdResolver,
  VerificationRelationshipType,
  exportKey,
  getFingerPrint,
  importKey,
} from '@trustcerts/core';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { DidIdTransactionCheckService } from '@tc/did-id/did-id-blockchain/did-id-transaction-check/did-id-transaction-check.service';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id-transaction.dto';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'winston';
import { RoleManageType } from '@tc/did-id/constants';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Administrates did objects.
 */
@Injectable()
export class GatewayDidService extends GatewayTransactionService {
  private resolver = new DidIdResolver();

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
    protected readonly didTransactionCheckService: DidIdTransactionCheckService,
    private readonly didCachedService: DidIdCachedService,
    protected readonly walletService: WalletClientService,
    protected readonly hashService: HashService,
    protected readonly configService: ConfigService,
    @Inject('winston') protected readonly logger: Logger,
  ) {
    super(
      gatewayBlockchainService,
      didTransactionCheckService,
      didCachedService,
      walletService,
      logger,
      configService,
    );
    this.didResolver = new DidIdResolver();
  }

  /**
   * Validates the transaction. Makes sure it's identifier is unique.
   * @param transaction
   */
  async updateDid(transaction: DidIdTransactionDto) {
    // const did = await this.didCachedService.getDid(transaction.body.value.id);
    // if (did) {
    //   throw new ConflictException('id already in use');
    // }
    return this.addTransaction(transaction);
  }

  /**
   * Signs the public key of a Client and returns persisted information. If the did already exists a new keypair will be added
   * @param createCert
   * @param role
   */
  createDid(
    createCert: CreateDidIdDto,
    role: RoleManageType,
  ): Promise<DidCreationResponse> {
    return this.didCachedService.getDid(createCert.identifier).then(
      () => {
        return this.resetModification(createCert);
      },
      () => {
        return this.setDid(createCert, [role]);
      },
    );
  }

  /**
   * Adds a new keypair to the did and removes the existing ones.
   * @param createCert
   * @private
   */
  private async resetModification(
    createCert: CreateDidIdDto,
  ): Promise<DidCreationResponse> {
    const transactions = await this.didCachedService.getTransactions(
      createCert.identifier,
    );
    if (transactions.length === 0) {
      throw new NotFoundException(`${createCert.identifier} not known`);
    }
    const did = await this.resolver.load(createCert.identifier, {
      validateChainOfTrust: false,
      // TODO remove after correction
      transactions: transactions as unknown as any,
    });
    did.getDocument().modification.forEach((id) => {
      did.removeVerificationRelationship(
        id,
        VerificationRelationshipType.modification,
      );
      did.removeKey(id);
    });
    const key = await importKey(createCert.publicKey, 'jwk', ['verify']);
    const fingerPrint = await getFingerPrint(key);
    did.addKey(fingerPrint, await exportKey(key));
    did.addVerificationRelationship(
      fingerPrint,
      VerificationRelationshipType.modification,
    );

    return this.getTransaction(did);
  }

  /**
   * Creates a transaction based on if a cert should be created or revoked. Transaction is passed to the blockchain service where it will be
   * broadcasted.
   * @param createCert
   * @param roles
   */
  private async setDid(
    createCert: CreateDidIdDto,
    roles: RoleManageType[] = [],
  ): Promise<DidCreationResponse> {
    // add the did
    const did = DidIdRegister.create({
      id: createCert.identifier,
      controllers: [await this.walletService.getOwnInformation()],
    });

    // add the given key
    const key = await importKey(createCert.publicKey, 'jwk', ['verify']);
    const fingerPrint = await getFingerPrint(key);
    did.addKey(fingerPrint, await exportKey(key));
    did.addVerificationRelationship(
      fingerPrint,
      VerificationRelationshipType.modification,
    );

    // add endpoint to resolve name
    const endpoint = this.configService.getString('OWN_PEER');
    did.addService('name', `${endpoint}/did/resolve/${did.id}`, 'resolver');

    // set role of the id
    roles.forEach((role) => {
      if (!did.hasRole(role)) {
        did.addRole(role);
      }
    });

    return this.getTransaction(did);
  }

  /**
   * Builds a transaction from the changes of a did.
   * @param did
   * @private
   */
  private async getTransaction(did: DidId) {
    // add transaction
    const didDocSignature: SignatureInfo = {
      type: SignatureType.single,
      values: [
        await this.walletService.signIssuer({
          document: did.getDocument(),
          version: did.getVersion() + 1,
        }),
      ],
    };
    const transaction = new DidIdTransactionDto(
      did.getChanges(),
      didDocSignature,
    );
    transaction.signature = {
      type: SignatureType.single,
      values: [
        await this.walletService.signIssuer(
          this.didCachedService.getValues(transaction),
        ),
      ],
    };
    return {
      metaData: await this.addTransaction(transaction, 'own'),
      transaction,
    };
  }
}
