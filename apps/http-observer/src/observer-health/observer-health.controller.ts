import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ObserverHealthService } from './observer-health.service';

/**
 * Endpoint for the health check
 */
@Controller('health')
export class ObserverHealthController {
  /**
   * Import required services.
   * @param health
   * @param observerHealthService
   */
  constructor(
    private health: HealthCheckService,
    private observerHealthService: ObserverHealthService,
  ) {}

  /**
   * Default health endpoint.
   */
  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([...this.observerHealthService.initChecks]);
  }

  /**
   * Health endpoint to validate if the node has passed the init checks.
   */
  @Get('init')
  initCheck() {
    return this.health.check(this.observerHealthService.initChecks);
  }
}
