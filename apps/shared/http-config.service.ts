import { Agent } from 'https';
import { ConfigService } from '@tc/config';
import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

/**
 * Config for the nestjs's http service.
 */
@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  /**
   * Injects required services.
   * @param configService
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Creates options based on config.
   */
  createHttpOptions(): HttpModuleOptions {
    return {
      timeout: this.configService.getNumber('HTTP_TIMEOUT'),
      maxRedirects: this.configService.getNumber('HTTP_REDIRECT'),
      httpsAgent: new Agent({
        rejectUnauthorized: this.configService.getBoolean(
          'REJECT_UNAUTHORIZED',
        ),
      }),
    };
  }
}
