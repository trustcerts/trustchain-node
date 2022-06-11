import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DID_ID_CONNECTION } from '../constants';
import {
  DidId,
  DidIdDocument,
} from '@tc/transactions/did-id/schemas/did-id.schema';
import {
  DidIdTransaction,
  DidIdTransactionDocument,
} from '../schemas/did-id-transaction.schema';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { HashService } from '@tc/blockchain';
import { IVerificationRelationships } from '../dto/i-verification-relationships.dto';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses the transaction that change a did document.
 */
@Injectable()
export class DidIdParsingService extends ParsingService {
  /**
   * Injects required services.
   * @param parser
   * @param hashService
   * @param clientRedis
   * @param logger
   * @param didIdDocumentRepository
   * @param transactionsCounter
   * @param didIdRepository
   * @param keyRepository
   * @param verificationRelationRepository
   * @param serviceRepository
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(DidId.name, DID_ID_CONNECTION)
    protected didIdRepository: Model<DidIdDocument>,
    @InjectModel(DidIdTransaction.name, DID_ID_CONNECTION)
    protected didIdDocumentRepository: Model<DidIdTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(
      clientRedis,
      hashService,
      transactionsCounter,
      didIdRepository,
      didIdDocumentRepository,
    );

    this.parseService.parsers.set(TransactionType.Did, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds the values to the database.
   * @param transaction
   */
  async parseDid(transaction: DidIdTransactionDto) {
    await this.addDocument(transaction);
    const did = await this.didIdRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ?? new this.didIdRepository({ id: transaction.body.value.id }),
      );

    await this.updateCoreValues(did, transaction);

    // update roles
    if (transaction.body.value.role) {
      if (transaction.body.value.role.remove) {
        did.roles = did.roles!.filter((role: DidRoles) =>
          transaction.body.value.role!.remove!.includes(role),
        );
      }
      if (transaction.body.value.role.add) {
        did.roles.push(...transaction.body.value.role.add);
      }
    }

    // update the keys
    const key = 'verificationMethod';
    if (transaction.body.value[key]) {
      if (transaction.body.value[key]!.remove) {
        did.keys = did.keys.filter(
          (usedKey) =>
            !transaction.body.value[key]!.remove?.includes(usedKey.id),
        );
      }
      if (transaction.body.value[key]!.add) {
        did.keys.push(...transaction.body.value[key]!.add!);
      }
    }

    // TODO store verification relationship
    const keys: IVerificationRelationships = {
      assertionMethod: true,
      authentication: true,
      modification: true,
    };
    Object.entries(transaction.body.value)
      // TODO removed second param value, validate change
      .filter(([key]) => {
        return Object.keys(keys).includes(key);
      })
      .map(([key, value]) => {
        let relation = did.verificationRelationships.find(
          (relation) => relation.method === key,
        );
        if (!relation) {
          relation = {
            method: key as keyof IVerificationRelationships,
            keyIds: [],
          };
          did.verificationRelationships.push(relation);
        }

        if (value.remove) {
          relation.keyIds = relation.keyIds.filter(
            (key) => !value.remove.includes(key),
          );
        }
        if (value.add) {
          relation.keyIds.push(...value.add);
        }
      }),
      await did.save();
    this.logger.debug({
      message: `set did: ${transaction.body.value.id}`,
      labels: { source: this.constructor.name },
    });
    this.created(transaction).then();
  }

  /**
   * Resets a database.
   */
  public reset(): Promise<any> {
    return Promise.all([
      this.didIdRepository.deleteMany(),
      this.didIdDocumentRepository.deleteMany(),
    ]);
  }
}
