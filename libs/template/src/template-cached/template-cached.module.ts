import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TEMPLATE_CONNECTION } from '../constants';
import { Template, TemplateSchema } from '../schemas/template.schema';
import { TemplateCachedService } from './template-cached.service';
import { TemplateDbModule } from '../template-db/template-db.module';

@Module({
  imports: [
    TemplateDbModule,
    MongooseModule.forFeature(
      [{ name: Template.name, schema: TemplateSchema }],
      TEMPLATE_CONNECTION,
    ),
  ],
  providers: [TemplateCachedService],
  exports: [TemplateCachedService],
})
export class TemplateCachedModule {}
