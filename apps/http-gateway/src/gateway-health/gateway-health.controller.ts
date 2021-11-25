import { Controller, Get } from '@nestjs/common';
import { GatewayHealthService } from './gateway-health.service';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

/**
 * Endpoint for the health check
 */
@Controller('health')
export class GatewayHealthController {
  /**
   * Import required services.
   * @param health
   * @param gatewayHealthService
   */
  constructor(
    private health: HealthCheckService,
    private gatewayHealthService: GatewayHealthService,
  ) {}

  /**
   * Default health endpoint.
   */
  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([...this.gatewayHealthService.initChecks]);
  }

  /**
   * Health endpoint to validate if the node has passed the init checks.
   */
  @Get('init')
  initCheck() {
    return this.health.check(this.gatewayHealthService.initChecks);
  }
}
