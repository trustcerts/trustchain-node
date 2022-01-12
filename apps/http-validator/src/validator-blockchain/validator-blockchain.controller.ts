import { Controller, HttpException } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { PersistedTransaction } from '../../../shared/persisted-transaction';
import {
  TRANSACTION_PARSED,
  TRANSACTION_REJECTED,
} from '@tc/event-client/constants';
import { ValidatorBlockchainService } from './validator-blockchain.service';

/**
 * Controller for internal events.
 */
@Controller('validator-blockchain')
export class ValidatorBlockchainController {
  /**
   * Imports required services.
   * @param validatorBlockchainService
   */
  constructor(
    private readonly validatorBlockchainService: ValidatorBlockchainService,
  ) {}

  /**
   * Listens when a transaction was parsed by the parser.
   * @param persisted
   */
  @EventPattern(TRANSACTION_PARSED, Transport.REDIS)
  transaction_parsed(persisted: PersistedTransaction) {
    this.validatorBlockchainService.persisted(persisted);
  }

  /**
   * Listens when a transaction was rejected by the network service.
   * @param values
   */
  @EventPattern(TRANSACTION_REJECTED, Transport.REDIS)
  transaction_rejected(values: { id: string; error: string }) {
    this.validatorBlockchainService.rejected(
      values.id,
      new HttpException(values.error, 422),
    );
  }
}
