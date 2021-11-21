import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';
import { VersionService } from '@tc/config/version/version.service';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    VersionService,
    makeGaugeProvider({
      name: 'startedInformation',
      help: 'values from the start of the service.',
    }),
    makeGaugeProvider({
      name: 'version',
      help: 'information about the version of the node',
      labelNames: ['version', 'build', 'major', 'minor', 'patch'],
    }),
  ],
})
export class VersionModule {}
