import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { GatewayRateLimitService } from './gateway-rate-limit.service';
import { NodeGuard } from '@shared/guards/node-guard.service';

/**
 * Endpoint to set a limit for a Client.
 */
@ApiBearerAuth()
@UseGuards(NodeGuard)
@ApiTags('security', 'rate limit')
@Controller('security/rate-limit')
export class RateLimitController {
  /**
   * Imports required services.
   * @param gatewayRateLimitService
   */
  constructor(
    private readonly gatewayRateLimitService: GatewayRateLimitService,
  ) {}

  /**
   * Sets the monthly limit of a Client.
   * @param identifier
   * @param limit
   */
  @ApiOperation({ summary: 'Sets the limit of the Client.' })
  @Post(':id/:limit')
  async set(@Param('id') identifier: string, @Param('limit') limit: number) {
    await this.gatewayRateLimitService.setLimit(identifier, limit);
  }
}
