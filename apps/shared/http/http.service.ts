import { CHAIN_REBUILD, PARSE_TCP_INJECTION } from '@tc/parse-client/constants';
import { ClientRedis, ClientTCP } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { Inject } from '@nestjs/common';
import { REDIS_INJECTION, SYSTEM_RESET } from '@tc/event-client/constants';

/**
 * Base class for http services.
 */
export class HttpService {
  /**
   * Injects required services.
   * @param clientParse
   * @param clientRedis
   * @param configService
   */
  constructor(
    @Inject(PARSE_TCP_INJECTION) protected clientParse: ClientTCP,
    @Inject(REDIS_INJECTION) protected clientRedis: ClientRedis,
    protected readonly configService: ConfigService,
  ) {}

  /**
   * Rebuilds the database based on the persisted chain. During the event the service is in maintenance mode and will reject every api call because
   * the database is incomplete.
   */
  async rebuild() {
    this.configService.setConfig('MAINTENANCE', true);
    await new Promise((resolve) => {
      this.clientParse.send<string>(CHAIN_REBUILD, {}).subscribe({
        complete: () => {
          resolve(true);
        },
      });
    });
    this.configService.setConfig('MAINTENANCE', false);
  }

  /**
   * Emits the event to reset all internal services.
   */
  reset(): void {
    // TODO make call sync so the http service can respond with a successful reset. Either use tcp or listen to events that the reset is completed.
    this.clientRedis.emit(SYSTEM_RESET, {});
  }
}
