import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ValidatorHealthController } from './validator-health.controller';
import { ValidatorHealthService } from './validator-health.service';

@Module({
  imports: [TerminusModule],
  providers: [ValidatorHealthService],
  controllers: [ValidatorHealthController],
})
export class ValidatorHealthModule {}
