import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import {
  NETWORK_PORT_TCP,
  NETWORK_TCP_INJECTION,
  NETWORK_URL,
} from './constants';

/**
 * provider to interact with the network service.
 */
export const networkTcpProvider = {
  provide: NETWORK_TCP_INJECTION,
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.getString(NETWORK_URL),
        port: configService.getNumber(NETWORK_PORT_TCP),
      },
    });
  },
  inject: [ConfigService],
};
