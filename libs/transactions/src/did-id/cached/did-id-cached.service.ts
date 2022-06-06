import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DID_ID_CONNECTION } from '../constants';
import {
  DidId,
  DidIdDocument,
} from '@tc/transactions/did-id/schemas/did-id.schema';
import { DidIdResolver, DidRoles } from '@trustcerts/did';
import {
  DidIdTransaction,
  DidIdTransactionDocument,
} from '../schemas/did-id-transaction.schema';
import { GenesisBlock } from '@tc/blockchain/block/genesis-block.dto';
import { IVerificationRelationships } from '../dto/i-verification-relationships.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Key } from '@tc/transactions/did-id/schemas/key.schema';
import { Model } from 'mongoose';
import { PersistClientService } from '@tc/clients/persist-client';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Service to interact with cached dids.
 */
@Injectable()
export class DidIdCachedService extends CachedService<DidIdResolver> {
  /**
   * Injects required services.
   * @param transactionModel
   * @param didModel
   * @param keyRepository
   * @param verificationRelationRepository
   */
  constructor(
    @InjectModel(DidIdTransaction.name, DID_ID_CONNECTION)
    protected transactionModel: Model<DidIdTransactionDocument>,
    @InjectModel(DidId.name, DID_ID_CONNECTION)
    protected didModel: Model<DidIdDocument>,
    private readonly persistClientService: PersistClientService,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidIdResolver();
  }

  /**
   * Returns the genesis block
   */
  getGenesis(): Promise<GenesisBlock> {
    // TODO cache it
    return this.persistClientService.getBlock(1) as Promise<GenesisBlock>;
  }

  /**
   * Returns a did element. If not found it will throw an error
   * @param id
   */
  async getDid(id: string, populate = ''): Promise<DidId> {
    const did = await this.didModel.findOne({ id }).populate(populate);
    if (!did) {
      throw new Error('not found');
    }
    return did;
  }

  /**
   * Maximum amount of validators regarding to the latest root certificate.
   */
  async getValidatorMax(): Promise<number> {
    const validators = await this.getValidatorIdentifiers();
    return validators.length;
  }

  /**
   * Returns all active validators' identifiers.
   */
  async getValidatorIdentifiers(): Promise<string[]> {
    return this.didModel.find().then((did) =>
      did
        .filter((did) => did.roles.includes(DidRoles.Validator))
        .map((did) => did.id)
        .sort(),
    );
  }

  /**
   * Checks if the issuer of the transaction has a key to sign hashes.
   * @param transaction
   */
  async canIssuerAssign(transaction: TransactionDto): Promise<boolean> {
    const keyId = transaction.signature.values[0].identifier;
    return (await this.canUse(keyId, 'assertionMethod')) !== undefined;
  }

  /**
   * Returns the identifier of a given key.
   * @param identifier
   */
  getIdentifierOfKey(identifier: string): string {
    return identifier.split('#')[0];
  }

  /**
   * Returns the key object that belongs to an identifier. Will throw an arrow if the key is not found.
   * @param identifier
   */
  async getKey(identifier: string) {
    // TODO validate
    return this.didModel
      .findOne({ id: this.getIdentifierOfKey(identifier) })
      .then((did) => {
        const key = did?.keys.find((key: Key) => key.id === identifier);
        if (!key) {
          throw new Error('key not found');
        }
        return key;
      });
  }

  /**
   * Returns the roles of a did. Normally there is only one role
   * @param keyIdentifier
   */
  async getRole(keyIdentifier: string): Promise<DidRoles[]> {
    const did = await this.getDidByKey(keyIdentifier);
    return did!.roles;
  }

  /**
   * Returns the did based on the key id.
   * @param keyIdentifier
   */
  async getDidByKey(keyIdentifier: string): Promise<DidId> {
    const id = this.getIdentifierOfKey(keyIdentifier);
    const did = await this.didModel.findOne({ id });
    if (!did) {
      throw new Error('did not found');
    }
    return did;
  }

  /**
   * Checks if a key can be used for a given operation like authentication.
   * @param key
   * @param method
   */
  async canUse(
    keyId: string,
    method: keyof IVerificationRelationships,
  ): Promise<Key | void> {
    const did = await this.getDidByKey(keyId);
    const relation = did?.verificationRelationships.find(
      (relationship) => relationship.method === method,
    );
    if (relation && relation.keyIds.includes(keyId)) {
      return did!.keys.find((key) => key.id === keyId);
    }
  }
}
