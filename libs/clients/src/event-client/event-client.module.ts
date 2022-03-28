import { ClientRedis } from '@nestjs/microservices';
import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { Logger } from 'winston';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { redisProvider } from '@tc/clients/event-client/redis.provider';

@Module({
  providers: [redisProvider],
  exports: [redisProvider],
})
export class EventClientModule implements OnApplicationBootstrap {
  constructor(
    @Inject(REDIS_INJECTION) private clientRedis: ClientRedis,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Called once the application has fully started and is bootstrapped.
   */
  async onApplicationBootstrap(): Promise<void> {
    await this.isHealthy();
  }

  async isHealthy(): Promise<void> {
    const intervalTime = 1000;
    const maxFailCounter = 10;
    let failCounter = 0;
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        this.clientRedis.connect().then(
          () => {
            clearInterval(interval);
            this.logger.info({
              message: `service is ready`,
              labels: { source: this.constructor.name },
            });
            resolve();
          },
          () => {
            failCounter++;
            this.logger.warn({
              message: `service not ready yet (${failCounter}/${maxFailCounter})`,
              labels: { source: this.constructor.name },
            });
            if (failCounter == maxFailCounter) {
              this.logger.error({
                message: `service not ready in time`,
                labels: { source: this.constructor.name },
              });
              clearInterval(interval);
            }
          },
        );
      }, intervalTime);
    });
  }
}
