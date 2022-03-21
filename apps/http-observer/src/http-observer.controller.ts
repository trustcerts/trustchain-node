import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ClientRedis } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { HttpController } from '@shared/http/http.controller';
import { HttpObserverService } from './http-observer.service';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { Logger } from 'winston';
import { NodeGuard } from '@shared/guards/node-guard.service';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { RoleManageType } from '@tc/transactions/did-id/constants';

/**
 * Controller to interact with the Observer.
 */
@ApiTags('node')
@Controller()
export class HttpObserverController extends HttpController {
  /**
   * Constructor to add a ObserverController.
   * @param observerService
   * @param trackingService
   * @param configService
   * @param clientRedis
   * @param logger
   */
  constructor(
    protected readonly observerService: HttpObserverService,
    protected readonly configService: ConfigService,
    @Inject(REDIS_INJECTION) protected clientRedis: ClientRedis,
    @Inject('winston') protected readonly logger: Logger,
  ) {
    super(observerService, configService, logger);
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
      serviceType: 'http',
      nodeType: RoleManageType.Observer,
      did: this.configService.getConfig('IDENTIFIER'),
    };
  }

  /**
   * Endpoint to pass an invite code to init this node.
   * @param values
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('init')
  @ApiOperation({ summary: 'Pass an invite code to init this node.' })
  @ApiResponse({
    status: 201,
    description: 'Node was successfully initialized.',
  })
  async init(@Body() values: InviteNode) {
    return this.observerService.invite(values);
  }
}
