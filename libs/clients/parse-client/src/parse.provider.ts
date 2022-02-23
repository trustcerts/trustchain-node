import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { PARSE_PORT_TCP, PARSE_URL } from './constants';
import { PARSE_TCP_INJECTION } from './constants';

/**
 * provider to interact with the Client module.
 */
export const parseTcpProvider = {
  provide: PARSE_TCP_INJECTION,
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.getString(PARSE_URL),
        port: configService.getNumber(PARSE_PORT_TCP),
      },
    });
  },
  inject: [ConfigService],
};
