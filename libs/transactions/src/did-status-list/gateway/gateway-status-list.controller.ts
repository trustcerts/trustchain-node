import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayStatusListService } from './gateway-status-list.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { StatusListResponse } from '../dto/status-list-response';
import { StatusListTransactionDto } from '@tc/transactions/did-status-list/dto/status-list.transaction.dto';

/**
 * Stores new statuslist transactions.
 */
@ApiTags('statuslist')
@UseGuards(MaintenanceGuard)
@Controller('statuslist')
export class GatewayStatusListController {
  /**
   * Injects required services.
   * @param gatewayStatusListService
   */
  constructor(
    private readonly gatewayStatusListService: GatewayStatusListService,
  ) {}
  /**
   * Adds new transaction to the chain.
   * @param transaction
   */
  @Post()
  @ApiOperation({ summary: 'Adds new statuslist to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: StatusListResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Id is already taken.',
  })
  async create(
    @Body() transaction: StatusListTransactionDto,
  ): Promise<StatusListResponse> {
    return this.gatewayStatusListService.addStatusList(transaction);
  }
}
