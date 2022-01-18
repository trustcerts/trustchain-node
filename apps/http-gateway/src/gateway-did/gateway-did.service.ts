import { ConfigService } from '@tc/config';
import { CreateDidDto } from '@tc/did/dto/create-did.dto';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { DidCreationResponse } from './responses';
import {
  DidId,
  DidIdResolver,
  VerificationRelationshipType,
  exportKey,
  getFingerPrint,
  importKey,
} from '@trustcerts/core';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { DidIdTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { DidTransactionCheckService } from '@tc/did/did-blockchain/did-transaction-check/did-transaction-check.service';
import { GatewayBlockchainService } from '../gateway-blockchain/gateway-blockchain.service';
import { GatewayTransactionService } from '../gateway-transaction.service';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Logger } from 'winston';
import { RoleManageAddEnum } from '@tc/did/constants';
import {
  SignatureInfo,
  SignatureType,
} from '@tc/blockchain/transaction/transaction.dto';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Administrates did objects.
 */
@Injectable()
export class GatewayDidService extends GatewayTransactionService {
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
    protected readonly didTransactionCheckService: DidTransactionCheckService,
    private readonly didCachedService: DidCachedService,
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
    createCert: CreateDidDto,
    role: RoleManageAddEnum,
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
    createCert: CreateDidDto,
  ): Promise<DidCreationResponse> {
    const transactions = await this.didCachedService.getTransactions(
      createCert.identifier,
    );
    if (transactions.length === 0) {
      throw new NotFoundException(`${createCert.identifier} not known`);
    }
    const did = await DidIdResolver.load(createCert.identifier, {
      validateChainOfTrust: false,
      transactions,
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
    createCert: CreateDidDto,
    roles: RoleManageAddEnum[] = [],
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
