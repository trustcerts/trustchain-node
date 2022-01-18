import { CachedService } from '@shared/cache.service';
import { DidId, DidIdDocument } from '@tc/did/schemas/did.schema';
import { DidIdDocument as DidIdDoc } from './did-document';
import { DidIdResolver } from '@trustcerts/core';
import {
  DidIdTransaction,
  DidTransactionDocument,
} from '../schemas/did-transaction.schema';
import { GenesisBlock } from '../../../../blockchain/src/block/genesis-block.dto';
import { IVerificationRelationships } from '../dto/did.transaction.dto';
import { IdDocResponse } from './doc-response';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Key } from '@tc/did/schemas/key.schema';
import { Model } from 'mongoose';
import { PersistClientService } from '@tc/persist-client';
import { RoleManageAddEnum } from '@tc/did/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { VersionInformation } from '../../../../../apps/shared/did/version-information';

/**
 * Service to interact with cached dids.
 */
@Injectable()
export class DidCachedService extends CachedService {
  /**
   * Injects required services.
   * @param transactionModel
   * @param didModel
   * @param keyRepository
   * @param verificationRelationRepository
   */
  constructor(
    @InjectModel(DidIdTransaction.name)
    protected transactionModel: Model<DidTransactionDocument>,
    @InjectModel(DidId.name)
    protected didModel: Model<DidIdDocument>,
    private readonly persistClientService: PersistClientService,
  ) {
    super(transactionModel, didModel);
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
    const did = await this.didModel.findById(id).populate(populate);
    if (!did) {
      throw new Error('not found');
    }
    return did;
  }

  /**
   * Returns an assembled did document with the transaction
   * @param id
   * @param version
   * @returns
   */
  async getDocument(
    id: string,
    version?: VersionInformation,
  ): Promise<IdDocResponse> {
    const query = this.transactionModel
      .find({
        id,
        createdAt: {
          $lte: version?.time
            ? new Date(version.time).toISOString()
            : new Date().toISOString(),
        },
      })
      .sort('createdAt');
    if (version?.id) {
      query.limit(version.id);
    }
    const transactions = await query.exec();
    if (transactions.length === 0) {
      throw new NotFoundException();
    }
    const did = await DidIdResolver.load(id, {
      transactions: transactions as DidIdTransaction[],
      validateChainOfTrust: false,
      doc: false,
    });
    return {
      document: did.getDocument() as DidIdDoc,
      signatures: transactions[transactions.length - 1].didDocumentSignature,
      metaData: await this.getDocumentMetaData(id, version),
    };
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
        .filter((did) => did.roles.includes(RoleManageAddEnum.Validator))
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
  async getRole(keyIdentifier: string): Promise<RoleManageAddEnum[]> {
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
