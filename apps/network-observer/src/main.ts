import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { NetworkObserverModule } from './network-observer.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  addRedisEndpoint,
  addTCPEndpoint,
  getLogger,
} from '@shared/main-functions';

/**
 * Function to configure and start a network Observer microservice.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    NetworkObserverModule,
    {
      logger: getLogger(),
    },
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  await addTCPEndpoint(app);
  await addRedisEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
