import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@apps/shared/did/did.controller';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaCachedService } from '@tc/schema/schema-cached/schema-cached.service';
import { SchemaDocResponse } from '@tc/schema/dto/schema-doc-response.dto';
import { SchemaTransaction } from '@tc/schema/schemas/schema-transaction.schema';

/**
 * Endpoint to get a schema.
 */
@ApiTags('schema')
@UseGuards(MaintenanceGuard)
@Controller('schema')
export class ObserverSchemaController extends DidControllerMixin<
  SchemaDocResponse,
  SchemaTransaction
>({ doc: SchemaDocResponse, trans: SchemaTransaction }) {
  constructor(protected readonly schemaCachedService: SchemaCachedService) {
    super(schemaCachedService);
  }
}
