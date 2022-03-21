import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayHashService } from './gateway-hash.service';
import { HashDidTransactionDto } from '@tc/did-hash/dto/hash-transaction.dto';
import { HashResponse } from '../dto/hash-respnse.dto';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';

/**
 * Endpoint to add or revoke hashes.
 */
@ApiTags('hash')
@UseGuards(MaintenanceGuard)
@Controller('hash')
export class GatewayHashController {
  constructor(private readonly gatewayHashService: GatewayHashService) {}

  /**
   * Adds new transaction to the chain.
   * @param transaction
   */
  @Post()
  @ApiOperation({ summary: 'Adds new hash to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: HashResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'The hash failed. The hash is already signed.',
  })
  async create(
    @Body() transaction: HashDidTransactionDto,
  ): Promise<HashResponse> {
    if (transaction.body.value.revoked) {
      return this.gatewayHashService.revokeHash(transaction);
    } else {
      return this.gatewayHashService.addHash(transaction);
    }
  }
}
