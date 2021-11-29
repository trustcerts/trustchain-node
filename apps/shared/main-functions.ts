import * as helmet from 'helmet';
import * as winston from 'winston';
import { ConfigService } from '@tc/config';
import { INestApplication, LoggerService } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule, utilities } from 'nest-winston';

/**
 * Adds helmet if the lets encrypt variable is set. Required for swagger rendering
 * @param app
 */
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
      url: `redis://${configService.getString(
        'REDIS_URL',
      )}:${configService.getNumber('REDIS_PORT')}`,
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
      host: '0.0.0.0',
      port: configService.getNumber('TCP_PORT'),
    },
  });
}