import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { Did, DidDocument } from '@tc/did/schemas/did.schema';
import {
  DidTransaction,
  DidTransactionDocument,
} from '../schemas/did-transaction.schema';
import {
  DidTransactionDto,
  IVerificationRelationships,
} from '@tc/did/dto/did.transaction.dto';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@shared/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { RoleManageAddEnum } from '../constants';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses the transaction that change a did document.
 */
@Injectable()
export class DidParsingService extends ParsingService {
  /**
   * Injects required services.
   * @param parser
   * @param hashService
   * @param clientRedis
   * @param logger
   * @param didDocumentRepository
   * @param transactionsCounter
   * @param didRepository
   * @param keyRepository
   * @param verificationRelationRepository
   * @param serviceRepository
   */
  constructor(
    protected readonly hashService: HashService,
    @Inject(REDIS_INJECTION) protected readonly clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
    @InjectModel(Did.name) private didRepository: Model<DidDocument>,
    @InjectModel(DidTransaction.name)
    private didDocumentRepository: Model<DidTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
  ) {
    super(clientRedis, hashService, transactionsCounter);

    this.parseService.parsers.set(TransactionType.Did, {
      parsing: this.parseDid.bind(this),
      reset: this.reset.bind(this),
    });
  }

  /**
   * Adds the document value to the chain.
   * @param transaction
   * @private
   */
  private async addDocument(transaction: DidTransactionDto) {
    const did = new this.didDocumentRepository({
      index: await this.hashService.hashTransaction(transaction),
      id: transaction.body.value.id,
      createdAt: transaction.body.date,
      values: transaction.body.value,
      signature: transaction.signature.values,
      didDocumentSignature: transaction.body.didDocSignature.values,
      block: {
        ...transaction.block,
        imported: transaction.metadata?.imported?.date,
      },
    });
    await did.save();
  }

  /**
   * Adds the values to the database.
   * @param transaction
   */
  async parseDid(transaction: DidTransactionDto) {
    await this.addDocument(transaction);
    const did = await this.didRepository
      .findOne({ id: transaction.body.value.id })
      .then(async (did) => {
        if (!did) {
          did = new this.didRepository({
            id: transaction.body.value.id,
            roles: [],
            controllers: [],
            keys: [],
            verificationRelationships: [],
            services: [],
          });
        }
        await did.save();
        return did;
      });

    // update roles
    if (transaction.body.value.role) {
      if (transaction.body.value.role.remove) {
        did.roles = did.roles!.filter((role: RoleManageAddEnum) =>
          transaction.body.value.role!.remove!.includes(role),
        );
      }
      if (transaction.body.value.role.add) {
        did.roles.push(...transaction.body.value.role.add);
      }
    }

    // update the controllers
    if (transaction.body.value.controller) {
      if (transaction.body.value.controller!.remove) {
        did.controllers = did.controllers.filter((controller: Did) =>
          transaction.body.value.controller!.remove!.includes(controller.id),
        );
      }
      if (transaction.body.value.controller!.add) {
        const newDids = await this.didRepository.find({
          id: { $in: transaction.body.value.controller!.add! },
        });
        if (newDids.length > 0) {
          did.controllers.push(...newDids);
        }
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([key, value]) => {
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
  public async reset(): Promise<void> {
    await Promise.all([
      this.didRepository.deleteMany(),
      this.didDocumentRepository.deleteMany(),
    ]);
  }
}
