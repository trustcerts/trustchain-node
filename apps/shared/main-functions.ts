import * as winston from 'winston';
import { ConfigService } from '@tc/config';
import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule, utilities } from 'nest-winston';
import helmet from 'helmet';

/**
 * Adds helmet if the lets encrypt variable is set. Required for swagger rendering
 * @param app
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function addHelmet(app: INestApplication) {
  if (process.env.LETSENCRYPT_HOST) {
    app.use(helmet());
  }
}

/**
 * Return a logger instance for a micro service.
 */
export function getLogger(): LoggerService {
  return WinstonModule.createLogger({
    transports: new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        utilities.format.nestLike(),
      ),
    }),
  });
}

/**
 * Adds the redis endpoint to a service.
 * @param app
 */
export async function addRedisEndpoint(app: INestApplication) {
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.REDIS,
    options: {
      host: configService.getString('REDIS_URL'),
      port: configService.getNumber('REDIS_PORT'),
      retryAttempts: 3,
      retryDelay: 1000,
    },
  });
}

/**
 * Adds the tcp endpoint to the service.
 * @param app
 */
export async function addTCPEndpoint(app: INestApplication) {
  const configService = app.get(ConfigService);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: configService.getString('TCP_URL'),
      port: configService.getNumber('TCP_PORT'),
    },
  });
}
