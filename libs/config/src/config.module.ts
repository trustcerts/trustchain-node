import * as Joi from 'joi';
import { ConfigService } from './config.service';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { VersionModule } from './version/version.module';

@Global()
@Module({
  imports: [
    VersionModule,
  ],
})
export class ConfigModule {
  static forRoot(values: {
    service: string;
    environment?: Joi.SchemaMap;
    dynamic?: Joi.SchemaMap;
  }): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        {
          provide: 'SERVICE',
          useValue: values.service,
        },
        {
          provide: 'STATIC',
          useValue: values.environment ?? {},
        },
        {
          provide: 'DYNAMIC',
          useValue: values.dynamic ?? {},
        },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}
