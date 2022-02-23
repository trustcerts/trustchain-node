import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { NetworkValidatorModule } from './network-validator.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  addRedisEndpoint,
  addTCPEndpoint,
  getLogger,
} from '@shared/main-functions';

// process.env.DEBUG = '*';
/**
 * Function to configure and start a network Validator micro service.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    NetworkValidatorModule,
    {
      logger: getLogger(),
    },
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // app.useWebSocketAdapter(new SocketIoAdapter(app, true));
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  await addTCPEndpoint(app);
  await addRedisEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
