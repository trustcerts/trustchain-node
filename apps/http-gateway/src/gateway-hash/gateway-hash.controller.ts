import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayHashService } from './gateway-hash.service';
import { HashResponse } from './dto/hash.respnse';
import { HashTransactionDto } from '@tc/hash/dto/hash-transaction.dto';
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
  @Post('create')
  @ApiOperation({ summary: 'Adds new hash to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: HashResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'The hash failed. The hash is already signed.',
  })
  async create(@Body() transaction: HashTransactionDto): Promise<HashResponse> {
    return this.gatewayHashService.addHash(transaction);
  }

  // /**
  //  * Adds new transaction the the chain to revoke a hash. Check before if the hash is already signed and if the user is allowed to revoke it.
  //  * @param transaction
  //  */
  // @Post('revoke')
  // @ApiOperation({ summary: 'Revokes a hash.' })
  // @ApiCreatedResponse({
  //   description: 'The hash was successfully revoked.',
  //   type: HashRevocationResponse,
  // })
  // revoke(
  //   @Body() transaction: HashRevocationTransactionDto,
  // ): Promise<HashRevocationResponse> {
  //   return this.gatewayHashService.revokeHash(transaction);
  // }
}
