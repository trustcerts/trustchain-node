import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import {
  PERSIST_PORT_TCP,
  PERSIST_TCP_INJECTION,
  PERSIST_URL,
} from './constants';

/**
 * provider to interact with the Client module.
 */
export const persistTcpProvider = {
  provide: PERSIST_TCP_INJECTION,
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.getString(PERSIST_URL),
        port: configService.getNumber(PERSIST_PORT_TCP),
      },
    });
  },
  inject: [ConfigService],
};
