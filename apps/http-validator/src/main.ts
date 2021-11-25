import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpValidatorModule } from './http-validator.module';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import {
  addHelmet,
  addRedisEndpoint,
  getLogger,
} from '../../shared/main-functions';
import { build, version } from '../../shared/build';

/**
 * Function to configure and start a http Validator micro service.
 */
async function bootstrap() {
  const applicationOptions: NestApplicationOptions = {
    logger: getLogger(),
  };
  const app = await NestFactory.create<NestExpressApplication>(
    HttpValidatorModule,
    applicationOptions,
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe());
  const options = new DocumentBuilder()
    .setTitle('Validator interaction')
    .setDescription('Explore the functionality of a Validator')
    .setVersion(`${version} - ${build}`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  addHelmet(app);
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  await addRedisEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
