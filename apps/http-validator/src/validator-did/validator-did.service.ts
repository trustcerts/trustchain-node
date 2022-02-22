import { ConfigService } from '@tc/config';
import { CreateDidIdDto } from '@tc/did-id/dto/create-did-id.dto';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id-transaction.dto';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import { RoleManageType } from '@tc/did-id/constants';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { ValidatorBlockchainService } from '../validator-blockchain/validator-blockchain.service';
import {
  VerificationRelationshipType,
  exportKey,
  getFingerPrint,
  importKey,
} from '@trustcerts/core';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Service that signs or revokes public keys from gateways.
 */
@Injectable()
export class ValidatorDidService {
  /**
   * Constructor to add a ValidatorPkiService
   * @param validatorBlockchainService
   * @param walletService
   * @param didCachedService
   * @param configService
   * @param logger
   */
  constructor(
    private readonly validatorBlockchainService: ValidatorBlockchainService,
    private readonly walletService: WalletClientService,
    private readonly didCachedService: DidIdCachedService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Signs the public key of an gateway and returns the created transaction.
   * @param createCert
   * @param role
   */
  createDid(
    createCert: CreateDidIdDto,
    role: RoleManageType,
  ): Promise<PersistedTransaction> {
    return this.setDid(createCert, [role]);
  }

  /**
   * Creates a transaction based on if a cert should be created or revoked. The transaction will be broadcast to all validators. A listener on the
   * transaction hash is triggered when the cert was persisted into the blockchain.
   * @param createCert
   * @param roles
   */
  private async setDid(
    createCert: CreateDidIdDto,
    roles: RoleManageType[] = [],
  ): Promise<PersistedTransaction> {
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

    did.addVerificationRelationship(
      fingerPrint,
      VerificationRelationshipType.authentication,
    );

    // add endpoint to resolve name
    // TODO replace with OWN peer to be independent from domain approach
    const endpoint = this.configService.getString('OWN_PEER');
    did.addService('name', `${endpoint}/did/resolve/${did.id}`, 'resolver');

    // set role of the id
    roles.forEach((role) => did.addRole(role));

    // add transaction
    const didDocSignature: SignatureInfo = {
      type: SignatureType.Single,
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
      type: SignatureType.Single,
      values: [
        await this.walletService.signIssuer(
          this.didCachedService.getValues(transaction),
        ),
      ],
    };
    return this.validatorBlockchainService.addTransaction(transaction);
  }
}
