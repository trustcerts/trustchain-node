import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@tc/config';
import { HttpController } from '../../shared/http/http.controller';
import { HttpGatewayService } from './http-gateway.service';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { InviteService } from '@tc/invite';
import { Logger } from 'winston';
import { NodeGuard } from '../../shared/guards/node-guard.service';

/**
 * Controller to handle requests to the gateway.
 */
@ApiTags('node')
@Controller()
export class HttpGatewayController extends HttpController {
  /**
   * Constructor to add a GatewayController.
   * @param gatewayService
   * @param inviteService
   * @param configService
   * @param logger
   */
  constructor(
    protected readonly gatewayService: HttpGatewayService,
    private readonly inviteService: InviteService,
    protected readonly configService: ConfigService,
    @Inject('winston') protected readonly logger: Logger,
  ) {
    super(gatewayService, configService, logger);
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
      nodeType: 'gateway',
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
    return this.gatewayService.invite(values);
  }

  /**
   * Resets the node.
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('reset')
  @ApiOperation({ summary: 'Resets the node' })
  @ApiResponse({
    status: 201,
    description: 'The node has been successfully reset.',
  })
  @ApiResponse({
    status: 403,
    description: "The configuration doesn't allow to reset this node.",
  })
  async reset() {
    if (!this.configService.getBoolean('RESET')) {
      throw new UnauthorizedException(
        "The configuration doesn't allow to reset this node.",
      );
    }
    this.logger.info({
      message: 'reset',
      labels: { source: this.constructor.name },
    });
    this.inviteService.clearTable().then();
    this.gatewayService.reset();
  }
}
