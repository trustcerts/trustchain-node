import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidSchemaTransaction } from '@tc/transactions/did-schema/schemas/did-schema-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaCachedService } from '@tc/transactions/did-schema/cached/schema-cached.service';
import { SchemaDocResponse } from '@tc/transactions/did-schema/dto/schema-doc-response.dto';

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
