import { ConfigService } from '@tc/config';
import { CreateDidIdDto } from '@tc/transactions/did-id/dto/create-did-id.dto';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidIdRegister, VerificationRelationshipType } from '@trustcerts/did';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { Injectable } from '@nestjs/common';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { ValidatorBlockchainService } from '../validator-blockchain/validator-blockchain.service';
import { WalletClientService } from '@tc/clients/wallet-client';
import { exportKey, importKey } from '@trustcerts/crypto';

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
  ) {}

  /**
   * Signs the public key of an gateway and returns the created transaction.
   * @param createCert
   * @param role
   */
  createDid(
    createCert: CreateDidIdDto,
    role: DidRoles,
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
    roles: DidRoles[] = [],
  ): Promise<PersistedTransaction> {
    // add the did
    const did = DidIdRegister.create({
      id: createCert.identifier,
      controllers: [await this.walletService.getOwnInformation()],
    });

    // add the given key
    const key = await importKey(createCert.publicKey, 'jwk', ['verify']);
    const keyService = await this.walletService.getCryptoKeyServiceByKey(
      createCert.publicKey,
    );
    const fingerPrint = await keyService.getFingerPrint(key);
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
      //@ts-ignore
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
