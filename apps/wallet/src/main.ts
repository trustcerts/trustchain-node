import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WalletModule } from './wallet.module';
import {
  addRedisEndpoint,
  addTCPEndpoint,
  getLogger,
} from '@shared/main-functions';

/**
 * Function to configure and start a Validator node.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WalletModule, {
    logger: getLogger(),
  });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  await addTCPEndpoint(app);
  await addRedisEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
