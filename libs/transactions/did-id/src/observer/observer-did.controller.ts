import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@shared/did/did.controller';
import { DidIdCachedService } from '@tc/did-id/cached/did-id-cached.service';
import { DidIdTransaction } from '@tc/did-id/schemas/did-id-transaction.schema';
import { GenesisBlock } from '@tc/blockchain/block/genesis-block.dto';
import { IdDocResponse } from '@tc/did-id/dto/doc-response.dto';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';

/**
 * Endpoint to get a did document.
 */
@ApiTags('did')
@UseGuards(MaintenanceGuard)
@Controller('did')
export class ObserverDidController extends DidControllerMixin<
  IdDocResponse,
  DidIdTransaction
>({ doc: IdDocResponse, trans: DidIdTransaction }) {
  /**
   * Injects required services.
   * @param didCachedService
   */
  constructor(protected readonly didCachedService: DidIdCachedService) {
    super(didCachedService);
  }

  /**
   * Returns the genesis block to build the chain of trust.
   */
  @Get('genesis')
  @ApiOperation({
    summary: 'Returns the genesis block to build the chain of trust',
  })
  @ApiResponse({
    status: 200,
    type: GenesisBlock,
  })
  genesis(): Promise<GenesisBlock> {
    return this.didCachedService.getGenesis();
  }
}
