import { DidTemplate, TemplateSchema } from '../schemas/did-template.schema';
import {
  DidTemplateTransaction,
  TemplateTransactionSchema,
} from '../schemas/did-template-transaction.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TEMPLATE_CONNECTION } from '../constants';
import { TemplateCachedService } from './template-cached.service';
import { TemplateDbModule } from '../db/template-db.module';

@Module({
  imports: [
    TemplateDbModule,
    MongooseModule.forFeature(
      [
        { name: DidTemplate.name, schema: TemplateSchema },
        {
          name: DidTemplateTransaction.name,
          schema: TemplateTransactionSchema,
        },
      ],
      TEMPLATE_CONNECTION,
    ),
  ],
  providers: [TemplateCachedService],
  exports: [TemplateCachedService],
})
export class TemplateCachedModule {}
