import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { DidDocumentMetaData } from '@trustcerts/sdk';
import { DidTransaction } from '@tc/did/schemas/did-transaction.schema';
import { DocResponse } from '@tc/did/did-cached/DocResponse';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';

/**
 * Endpoint to get a did document.
 */
@ApiTags('did')
@UseGuards(MaintenanceGuard)
@Controller('did')
export class ObserverDidController {
  /**
   * Injects required services.
   * @param didCachedService
   */
  constructor(private readonly didCachedService: DidCachedService) {}

  /**
   * Returns the genesis block to build the chain of trust.
   */
  @Get('genesis')
  @ApiOperation({
    summary: 'Returns the genesis block to build the chain of trust',
  })
  genesis() {
    this.didCachedService.getGenesis();
  }

  /**
   * Returns the transactions of a did document.
   * @param identifier
   */
  @Get(':id')
  @ApiOperation({
    summary: 'returns the transaction to assemble a did document.',
  })
  @ApiParam({ name: 'id', description: 'identifier of the did.' })
  @ApiQuery({
    name: 'versionTime',
    required: false,
    type: String,
    description: `only request transactions that are less than the given timestamp like ${new Date().toISOString()}`,
  })
  @ApiQuery({
    name: 'versionId',
    required: false,
    type: Number,
    description: 'only request transactions that belong to reach the version',
  })
  getTransactions(
    @Param('id') identifier: string,
    @Query('versionTime') time: string,
    @Query('versionId') id: number,
  ): Promise<DidTransaction[]> {
    return this.didCachedService.getTransactions(identifier, {
      time,
      id,
    });
  }

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
  ): Promise<DocResponse> {
    return this.didCachedService.getDocument(identifier, {
      time,
      id,
    });
  }

  /**
   * Returns the metadata of a did document.
   * @param identifier
   * @param time
   * @param id
   * @returns
   */
  @Get(':id/metadata')
  @ApiOperation({ summary: 'returns the did document metadata to a did.' })
  @ApiParam({ name: 'id', description: 'identifier of the did.' })
  @ApiQuery({
    name: 'versionTime',
    required: false,
    description: `only request transactions that are less than the given timestamp ${new Date().toISOString()}`,
  })
  @ApiQuery({
    name: 'versionId',
    required: false,
    description: 'only request transactions that belong to reach the version',
  })
  metaData(
    @Param('id') identifier: string,
    @Query('versionTime') time: string,
    @Query('versionId') id: number,
  ): Promise<DidDocumentMetaData> {
    return this.didCachedService.getDocumentMetaData(identifier, {
      id,
      time,
    });
  }
}