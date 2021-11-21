import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpGatewayModule } from './http-gateway.module';
import { NestApplicationOptions } from '@nestjs/common/interfaces/nest-application-options.interface';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { addRedisEndpoint, getLogger } from '../../shared/main-functions';
import { build, version } from '../../shared/build';
import { json } from 'body-parser';
/**
 * Function to configure and start a http gateway micro service.
 */
async function bootstrap() {
  const applicationOptions: NestApplicationOptions = {
    cors: true,
    logger: getLogger(),
  };
  const app = await NestFactory.create<NestExpressApplication>(
    HttpGatewayModule,
    applicationOptions,
  );
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '1mb' }));
  const options = new DocumentBuilder()
    .setTitle('Gateway interaction')
    .setDescription('Explore the functionality of an gateway')
    .setVersion(`${version} - ${build}`)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  // Starts listening for shutdown hooks
  app.enableShutdownHooks();
  await addRedisEndpoint(app);
  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap().then();
