import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { PersistService } from './persist.service';

/**
 * Provider to make a health check for the blockchain interaction.
 */
@Injectable()
export class BlockchainHealthIndicator extends HealthIndicator {
  /**
   * Creates a BlockchainHealthIndicator.
   * @param persistService
   */
  constructor(private persistService: PersistService) {
    super();
  }

  /**
   * checks if the blockchain is still healthy.
   * @param key
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const counter = this.persistService.blockCounter;
    const latestBlock = this.persistService.latestBlock();

    const isHealthy = counter === (latestBlock ? latestBlock.index : 0);
    const result = this.getStatus(key, isHealthy, { blocks: counter });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Blockchain check failed', result);
  }
}
