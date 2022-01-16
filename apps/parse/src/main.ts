import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ParseModule } from './parse.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  addRedisEndpoint,
  addTCPEndpoint,
  getLogger,
} from '@shared/main-functions';

/**
 * Function to configure and start a parse microservice.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(ParseModule, {
    logger: getLogger(),
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  // used to parse new blocks
  await addRedisEndpoint(app);
  await addTCPEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
