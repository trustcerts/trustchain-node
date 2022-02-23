import { ConfigService } from '@tc/config/config.service';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { ValidatorConsensusService } from './validator-consensus.service';

/**
 * Provider to make a health check for the blockchain interaction.
 */
@Injectable()
export class ConsensusHealthIndicator extends HealthIndicator {
  /**
   * Creates a ConsensusHealthIndicator.
   * @param validatorConsensusService
   * @param configService
   */
  constructor(
    private readonly validatorConsensusService: ValidatorConsensusService,
    private readonly configService: ConfigService,
  ) {
    super();
  }

  /**
   * checks if the blockchain is still healthy.
   * @param key
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = this.validatorConsensusService.ready;
    const result = this.getStatus(key, isHealthy, {
      error: 'no proposer set',
    });

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Consensus check failed', result);
  }
}
