import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@tc/config';
import { EventPattern, Transport } from '@nestjs/microservices';
import { HttpService } from './http.service';
import { Logger } from 'winston';
import { NEW_IDENTIFIER } from 'libs/clients/wallet-client/src/constants';
import { NodeGuard } from '../node-guard.service';
import { Post, UnauthorizedException, UseGuards } from '@nestjs/common';

/**
 * Base http controller for all nodes' http services.
 */
export class HttpController {
  /**
   * Injects required services.
   * @param httpService
   * @param configService
   */
  constructor(
    protected readonly httpService: HttpService,
    protected readonly configService: ConfigService,
    protected readonly logger: Logger,
  ) {}

  /**
   * Rebuild the pki and hash database based on the local blockchain.
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('rebuild')
  @ApiOperation({
    summary:
      'Rebuilds the pki and hash database based on the local blockchain.',
  })
  @ApiResponse({
    status: 201,
    description: 'The pki and hash database have been successfully rebuilt.',
  })
  async rebuild() {
    this.logger.debug({
      message: 'rebuild',
      labels: { source: this.constructor.name },
    });
    return this.httpService.rebuild();
  }

  /**
   * Sets a new identifier that was generated.
   * @param id
   */
  @EventPattern(NEW_IDENTIFIER, Transport.REDIS)
  setIdentifier(id: string) {
    this.configService.setConfig('IDENTIFIER', id);
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
    this.httpService.reset();
  }
}
