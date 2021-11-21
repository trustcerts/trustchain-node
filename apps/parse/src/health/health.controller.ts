import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

/**
 * Health check endpoint.
 */
@Controller('health')
export class HealthController {
  /**
   * Injects required services.
   * @param healthCheckService
   */
  constructor(private readonly healthCheckService: HealthCheckService) {}

  /**
   * Returns true if the node started successfully with all its dependencies.
   */
  @Get()
  @HealthCheck()
  check() {
    return this.healthCheckService.check([]);
  }
}
