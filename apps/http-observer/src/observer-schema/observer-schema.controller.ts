import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaCachedService } from '@tc/schema/schema-cached/schema-cached.service';
import { SchemaDocResponse } from '@tc/schema/dto/schema-doc-response';

/**
 * Endpoint to get a schema.
 */
@ApiTags('schema')
@UseGuards(MaintenanceGuard)
@Controller('schema')
export class ObserverSchemaController {
  constructor(private readonly schemaCachedService: SchemaCachedService) {}

  /**
   * Returns the did document.
   * @param identifier
   */
  @Get(':id/doc')
  @ApiOperation({ summary: 'returns the did document to a did.' })
  @ApiParam({ name: 'id', description: 'identifier of the did.' })
  @ApiQuery({
    name: 'versionTime',
    required: false,
    type: String,
    description: `return the did document that was present to ${new Date().toISOString()}`,
  })
  @ApiQuery({
    name: 'versionId',
    required: false,
    type: Number,
    description: 'return the did document with this version',
  })
  getDoc(
    @Param('id') identifier: string,
    @Query('versionTime') time: string,
    @Query('versionId') id: number,
  ): Promise<SchemaDocResponse> {
    return this.schemaCachedService.getDocument(identifier, {
      time,
      id,
    });
  }
}
