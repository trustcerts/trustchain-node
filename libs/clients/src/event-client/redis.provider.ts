import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';

/**
 * provider to interact with the Client module.
 */
export const redisProvider = {
  provide: REDIS_INJECTION,
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: `redis://${configService.getString(
          'REDIS_URL',
        )}:${configService.getNumber('REDIS_PORT')}`,
        retryAttempts: 10,
        retryDelay: 1000,
      },
    });
  },
  inject: [ConfigService],
};
