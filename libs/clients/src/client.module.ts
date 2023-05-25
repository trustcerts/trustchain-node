import { ConfigService } from '@tc/config';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';

/**
 * Base class of all Client modules to interact with micro services.
 */
export class ClientModule {
  /**
   * Injects required services.
   * @param configService
   * @param httpService
   * @param logger
   */
  constructor(
    protected readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {}

  /**
   * Requests the health endpoint for a period of time. Resolves the promise if
   * the health endpoint returns a 200 status. If the response was not successful
   * after some retires, the promise is not resolved.
   * @param key
   */
  isHealthy(host: string, port = 3000): Promise<void> {
    const intervalTime = 1000;
    const maxFailCounter = 20;
    let failCounter = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        this.httpService
          .get(`http://${host}:${port}/health`, {
            timeout: intervalTime,
          })
          .subscribe({
            next: (data) => {
              if (data.status === 200) {
                clearInterval(interval);
                this.logger.info({
                  message: `service is ready on ${host}:${port}`,
                  labels: { source: this.constructor.name },
                });
                resolve();
              }
            },
            error: () => {
              failCounter++;
              this.logger.warn({
                message: `service (${host}:${port}) not ready yet (${failCounter}/${maxFailCounter})`,
                labels: { source: this.constructor.name },
              });
              if (failCounter == maxFailCounter) {
                this.logger.error({
                  message: `service not ready in time`,
                  labels: { source: this.constructor.name },
                });
                // no not clear interval, the dependant service can come online again. Logging an error should be engouth so the system can revocer from itself.
                // reject(`${host} service not ready in time`);
              }
            },
          });
      }, intervalTime);
    });
  }
}
