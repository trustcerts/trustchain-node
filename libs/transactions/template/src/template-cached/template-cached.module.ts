import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TEMPLATE_CONNECTION } from '../constants';
import { Template, TemplateSchema } from '../schemas/template.schema';
import { TemplateCachedService } from './template-cached.service';
import { TemplateDbModule } from '../template-db/template-db.module';
import {
  TemplateTransaction,
  TemplateTransactionSchema,
} from '../schemas/template-transaction.schema';

@Module({
  imports: [
    TemplateDbModule,
    MongooseModule.forFeature(
      [
        { name: Template.name, schema: TemplateSchema },
        { name: TemplateTransaction.name, schema: TemplateTransactionSchema },
      ],
      TEMPLATE_CONNECTION,
    ),
  ],
  providers: [TemplateCachedService],
  exports: [TemplateCachedService],
})
export class TemplateCachedModule {}
