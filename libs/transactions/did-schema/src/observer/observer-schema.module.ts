import { Module } from '@nestjs/common';
import { ObserverSchemaController } from './observer-schema.controller';
import { SchemaCachedModule } from '@tc/did-schema/cached/schema-cached.module';

@Module({
  imports: [SchemaCachedModule],
  controllers: [ObserverSchemaController],
})
export class ObserverSchemaModule {}
