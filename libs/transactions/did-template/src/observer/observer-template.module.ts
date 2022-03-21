import { Module } from '@nestjs/common';
import { ObserverTemplateController } from './observer-template.controller';
import { TemplateCachedModule } from '@tc/did-template/cached/template-cached.module';

@Module({
  imports: [TemplateCachedModule],
  controllers: [ObserverTemplateController],
})
export class ObserverTemplateModule {}
