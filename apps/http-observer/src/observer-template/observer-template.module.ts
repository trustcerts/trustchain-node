import { Module } from '@nestjs/common';
import { ObserverTemplateController } from './observer-template.controller';
import { TemplateCachedModule } from '@tc/template/template-cached/template-cached.module';

@Module({
  imports: [TemplateCachedModule],
  controllers: [ObserverTemplateController],
})
export class ObserverTemplateModule {}
