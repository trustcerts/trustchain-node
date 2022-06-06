import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { EventPattern, Transport } from '@nestjs/microservices';
import { Logger } from 'winston';
import { NetworkGatewayService } from './network-gateway.service';
import { P2PService } from '@tc/p2-p';
import {
  SYSTEM_RESET,
  TRANSACTION_CREATED,
} from '@tc/clients/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Endpoint to interact with the network service of the gateway.
 */
@Controller()
export class NetworkGatewayController implements OnApplicationBootstrap {
  /**
   * Imports required services.
   * @param networkGatewayService
   * @param p2PService
   * @param client
   * @param logger
   */
  constructor(
    private readonly networkGatewayService: NetworkGatewayService,
    private readonly p2PService: P2PService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Called once the application has fully started and is bootstrapped.
   */
  async onApplicationBootstrap() {
    await this.p2PService.init();
  }

  /**
   * Returns the type of the node and the service that was exposed
   */
  @ApiOperation({
    summary: 'Returns the type of the node and the service that was exposed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Type of node and service as script.',
  })
  @Get()
  public information() {
    return {
      serviceType: 'network',
      nodeType: DidRoles.Gateway,
    };
  }

  /**
   * Listens to new transaction from the http service.
   * @param transaction
   */
  @EventPattern(TRANSACTION_CREATED, Transport.REDIS)
  newTransaction(transaction: TransactionDto) {
    this.networkGatewayService.addTransaction(transaction);
  }

  /**
   * Resets the service.
   */
  @EventPattern(SYSTEM_RESET, Transport.REDIS)
  reset() {
    this.logger.info({
      message: 'reset service',
      labels: { source: this.constructor.name },
    });
    this.p2PService.closeAll();
    this.p2PService.reset = true;
  }
}
