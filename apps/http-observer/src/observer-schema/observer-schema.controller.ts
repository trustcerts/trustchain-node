import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@shared/did/did.controller';
import { DidSchemaTransaction } from '@tc/schema/schemas/did-schema-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaCachedService } from '@tc/schema/schema-cached/schema-cached.service';
import { SchemaDocResponse } from '@tc/schema/dto/schema-doc-response.dto';

/**
 * Endpoint to get a schema.
 */
@ApiTags('schema')
@UseGuards(MaintenanceGuard)
@Controller('schema')
export class ObserverSchemaController extends DidControllerMixin<
  SchemaDocResponse,
  DidSchemaTransaction
>({ doc: SchemaDocResponse, trans: DidSchemaTransaction }) {
  constructor(protected readonly schemaCachedService: SchemaCachedService) {
    super(schemaCachedService);
  }
}