import { Module } from '@nestjs/common';
import { ObserverSchemaController } from './observer-schema.controller';
import { SchemaCachedModule } from '@tc/transactions/did-schema/cached/schema-cached.module';

@Module({
  imports: [SchemaCachedModule],
  controllers: [ObserverSchemaController],
})
export class ObserverSchemaModule {}
