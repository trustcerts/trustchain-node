import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidIdTransaction } from '@tc/transactions/did-id/schemas/did-id-transaction.schema';
import { DidIdVerifierService } from '@trustcerts/did';
import { GenesisBlock } from '@tc/blockchain/block/genesis-block.dto';
import { IdDocResponse } from '@tc/transactions/did-id/dto/doc-response.dto';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';

/**
 * Endpoint to get a did document.
 */
@ApiTags('did')
@UseGuards(MaintenanceGuard)
@Controller('did')
export class ObserverDidController extends DidControllerMixin<
  IdDocResponse,
  DidIdTransaction,
  DidIdVerifierService
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
