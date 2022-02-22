import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ConfigService } from '@tc/config';
import {
  Controller,
  Get,
  Inject,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { HttpController } from '@shared/http/http.controller';
import { HttpValidatorService } from './http-validator.service';
import { InviteService } from '@tc/invite';
import { Logger } from 'winston';
import { NodeGuard } from '@shared/guards/node-guard.service';
import { RoleManageType } from '@tc/did-id/constants';

/**
 * Controller to handle requests to the Validator.
 */
@ApiTags('node')
@Controller()
export class HttpValidatorController extends HttpController {
  /**
   * Constructor to add a ValidatorController.
   * @param validatorService
   * @param configService
   * @param clientRedis
   * @param logger
   * @param inviteService
   */
  constructor(
    protected readonly validatorService: HttpValidatorService,
    protected readonly configService: ConfigService,
    @Inject('winston') protected readonly logger: Logger,
    private readonly inviteService: InviteService,
  ) {
    super(validatorService, configService, logger);
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
      nodeType: RoleManageType.Validator,
      did: this.configService.getConfig('IDENTIFIER'),
    };
  }

  /**
   * Resets the node.
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('reset')
  @ApiOperation({ summary: 'Resets the node.' })
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
    this.logger.debug({
      message: 'reset',
      labels: { source: this.constructor.name },
    });
    await this.inviteService.clearTable();
    this.validatorService.reset();
  }
}
