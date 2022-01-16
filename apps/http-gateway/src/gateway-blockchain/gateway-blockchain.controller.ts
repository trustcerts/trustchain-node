import { Controller, HttpException } from '@nestjs/common';
import { EventPattern, Transport } from '@nestjs/microservices';
import { GatewayBlockchainService } from './gateway-blockchain.service';
import { PersistedTransaction } from '@shared/http/persisted-transaction';
import {
  TRANSACTION_PARSED,
  TRANSACTION_REJECTED,
} from '@tc/event-client/constants';

/**
 * Events the service listens to. Only listens to events inside of the system.
 */
@Controller('gateway-blockchain')
export class GatewayBlockchainController {
  constructor(
    private readonly gatewayBlockchainService: GatewayBlockchainService,
  ) {}

  /**
   * Listener when a transaction was parsed by the parser.
   * @param persisted
   */
  @EventPattern(TRANSACTION_PARSED, Transport.REDIS)
  transaction_parsed(persisted: PersistedTransaction) {
    this.gatewayBlockchainService.persisted(persisted);
  }

  /**
   * Listener when a transaction was rejected by the network microservice.
   * @param values
   */
  @EventPattern(TRANSACTION_REJECTED, Transport.REDIS)
  transaction_rejected(values: { id: string; error: Error }) {
    this.gatewayBlockchainService.rejected(
      values.id,
      new HttpException(values.error, 422),
    );
  }
}
