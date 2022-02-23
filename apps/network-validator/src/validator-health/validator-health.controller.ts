import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ValidatorHealthService } from './validator-health.service';

/**
 * Endpoint for the health check
 */
@Controller('health')
export class ValidatorHealthController {
  /**
   * Import required services.
   * @param health
   * @param validatorHealthService
   */
  constructor(
    private health: HealthCheckService,
    private validatorHealthService: ValidatorHealthService,
  ) {}

  /**
   * Default health endpoint.
   */
  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      // ...this.validatorHealthService.initChecks,
      // ...this.validatorHealthService.certChecks,
      // ...this.validatorHealthService.consensusChecks,
    ]);
  }

  /**
   * Health endpoint to validate if the node has passed the init checks.
   */
  @Get('init')
  initCheck() {
    // check if all services are healthy. Call endpoints of the other services via health.
    return this.health.check([]);
  }

  /**
   * Health endpoint that returns true if the node as a certificate to be part of a network.
   */
  @Get('cert')
  certCheck() {
    return this.health.check([]);
  }

  /**
   * Health endpoint that returns true if the consensus is healthy for this node.
   */
  @Get('consensus')
  consensusCheck() {
    // return this.health.check(this.validatorHealthService.consensusChecks);
  }
}
