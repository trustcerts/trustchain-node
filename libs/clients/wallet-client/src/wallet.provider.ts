import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { WALLET_PORT_TCP, WALLET_URL } from './constants';
import { WALLET_TCP_INJECTION } from './constants';

/**
 * provider to interact with the Client module.
 */
export const walletTcpProvider = {
  provide: WALLET_TCP_INJECTION,
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: configService.getString(WALLET_URL),
        port: configService.getNumber(WALLET_PORT_TCP),
      },
    });
  },
  inject: [ConfigService],
};
