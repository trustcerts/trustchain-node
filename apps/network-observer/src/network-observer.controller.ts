import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  ClientRedis,
  ClientTCP,
  EventPattern,
  Transport,
} from '@nestjs/microservices';
import {
  Controller,
  Get,
  Inject,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { Logger } from 'winston';
import { P2PService } from '@tc/p2-p';
import {
  REDIS_INJECTION,
  SYSTEM_RESET,
} from 'libs/clients/event-client/src/constants';
import { WALLET_TCP_INJECTION } from '../../shared/constants';

/**
 * Endpoint to interact with the network service of the Observer
 */
@Controller()
export class NetworkObserverController implements OnApplicationBootstrap {
  /**
   * Import required services.
   * @param p2PService
   * @param client
   * @param wallet
   * @param logger
   */
  constructor(
    private readonly p2PService: P2PService,
    @Inject(REDIS_INJECTION) private readonly client: ClientRedis,
    @Inject(WALLET_TCP_INJECTION) private readonly wallet: ClientTCP,
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
      nodeType: 'observer',
    };
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
