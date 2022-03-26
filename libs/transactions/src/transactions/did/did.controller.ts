import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidDocumentMetaData } from './dto/did-document-meta-data.dto';
import { DidTransaction } from './schemas/did-transaction.schema';
import { DocResponse } from './dto/doc-response.dto';
import { Get, NotFoundException, Param, Query } from '@nestjs/common';

/**
 * Default class for an observer to handle did requests.
 */
export function DidControllerMixin<
  D extends DocResponse,
  T extends DidTransaction,
>(options: { doc: typeof DocResponse; trans: typeof DidTransaction }): any {
  @ApiExtraModels(DocResponse, DidTransaction)
  class DidController {
    constructor(protected didCachedService: CachedService) {}

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
    @ApiResponse({
      type: options.trans,
      isArray: true,
      status: 200,
    })
    getTransactions(
      @Param('id') identifier: string,
      @Query('versionTime') time: string,
      @Query('versionId') id: number,
    ): Promise<T[]> {
      return this.didCachedService
        .getTransactions<T>(identifier, {
          time,
          id,
        })
        .then((transactions) => {
          if (transactions.length === 0) {
            throw new NotFoundException();
          }
          return transactions;
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
    @ApiResponse({
      // TODO extend doc with getSchemaPath(DocResponse)
      type: options.doc,
      status: 200,
    })
    getDoc(
      @Param('id') identifier: string,
      @Query('versionTime') time: string,
      @Query('versionId') id: number,
    ): Promise<D> {
      return this.didCachedService.getDocument<D>(identifier, {
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
  return DidController;
}
