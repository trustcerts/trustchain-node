import { HashModule } from '@tc/blockchain';
import { Module } from '@nestjs/common';
import { ParsingService } from './parsing.service';
import {
  PrometheusModule,
  makeCounterProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    HashModule,
    PrometheusModule.register({
      defaultMetrics: {
        enabled: false,
      },
    }),
  ],
  providers: [
    ParsingService,
    makeCounterProvider({
      name: 'transactions',
      labelNames: ['type'],
      help: 'parsing transactions',
    }),
  ],
  exports: [ParsingService, HashModule],
})
export class ParsingModule {}
