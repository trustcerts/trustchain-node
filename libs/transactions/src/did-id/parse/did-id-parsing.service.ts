import { ClientRedis } from '@nestjs/microservices';
import { Counter } from 'prom-client';
import { DID_ID_CONNECTION } from '../constants';
import { DidId } from '@trustcerts/did';
import { DidIdDocumentDocument } from '@tc/transactions/did-id/schemas/did-id.schema';
import {
  DidIdTransaction,
  DidIdTransactionDocument,
} from '../schemas/did-id-transaction.schema';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { HashService } from '@tc/blockchain';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { ParseService } from '@apps/parse/src/parse.service';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { StateService } from '@apps/parse/src/state/state.service';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';

/**
 * Parses the transaction that change a did document.
 */
@Injectable()
export class DidIdParsingService extends ParsingService<DidIdTransactionDocument> {
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
    protected didIdRepository: Model<DidIdDocumentDocument>,
    @InjectModel(DidIdTransaction.name, DID_ID_CONNECTION)
    protected didIdDocumentRepository: Model<DidIdTransactionDocument>,
    @InjectMetric('transactions')
    protected readonly transactionsCounter: Counter<string>,
    private readonly parseService: ParseService,
    private readonly stateService: StateService,
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
    await this.addTransaction(transaction);
    const did = await this.didIdRepository
      .findOne({ id: transaction.body.value.id })
      .then(
        (did) =>
          did ?? new this.didIdRepository({ id: transaction.body.value.id }),
      );

    await this.updateCoreValues(did, transaction);

    // update roles
    if (transaction.body.value.role) {
      if (!did.role) did.role = [];
      if (transaction.body.value.role.remove) {
        did.role = did.role!.filter((role: DidRoles) =>
          transaction.body.value.role!.remove!.includes(role),
        );
      }
      if (transaction.body.value.role.add) {
        did.role.push(...transaction.body.value.role.add);
      }
    }

    if (transaction.body.value.verificationMethod) {
      if (!did.verificationMethod) did.verificationMethod = [];
      if (transaction.body.value.verificationMethod!.remove) {
        did.verificationMethod = did.verificationMethod.filter(
          (usedKey) =>
            !transaction.body.value.verificationMethod!.remove?.includes(
              usedKey.id,
            ),
        );
      }
      if (transaction.body.value.verificationMethod!.add) {
        did.verificationMethod.push(
          ...transaction.body.value.verificationMethod!.add!,
        );
      }
    }

    if (transaction.body.value.assertionMethod) {
      if (!did.assertionMethod) did.assertionMethod = [];
      if (transaction.body.value.assertionMethod!.remove) {
        did.assertionMethod = did.assertionMethod.filter(
          (usedKey) =>
            !transaction.body.value.assertionMethod!.remove?.includes(usedKey),
        );
      }
      if (transaction.body.value.assertionMethod!.add) {
        did.assertionMethod.push(
          ...transaction.body.value.assertionMethod!.add!,
        );
      }
    }

    if (transaction.body.value.authentication) {
      if (!did.modification) did.modification = [];
      if (transaction.body.value.authentication!.remove) {
        did.authentication = did.authentication.filter(
          (usedKey) =>
            !transaction.body.value.authentication!.remove?.includes(usedKey),
        );
      }
      if (transaction.body.value.authentication!.add) {
        did.authentication.push(...transaction.body.value.authentication!.add!);
      }
    }

    if (transaction.body.value.modification) {
      if (!did.modification) did.modification = [];
      if (transaction.body.value.modification!.remove) {
        did.modification = did.modification.filter(
          (usedKey) =>
            !transaction.body.value.modification!.remove?.includes(usedKey),
        );
      }
      if (transaction.body.value.modification!.add) {
        did.modification.push(...transaction.body.value.modification!.add!);
      }
    }

    if (transaction.body.value.service) {
      if (!did.service) did.service = [];
      if (transaction.body.value.service!.remove) {
        did.service = did.service.filter(
          (usedKey) =>
            !transaction.body.value.service!.remove?.includes(usedKey.id),
        );
      }
      if (transaction.body.value.service!.add) {
        did.service.push(...transaction.body.value.service!.add!);
      }
    }

    await did.save();
    this.logger.debug({
      message: `set did: ${transaction.body.value.id}`,
      labels: { source: this.constructor.name },
    });
    await this.stateService.addElement(did);
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
