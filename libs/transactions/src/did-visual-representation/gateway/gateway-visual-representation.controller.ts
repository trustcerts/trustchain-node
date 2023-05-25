import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayVisualRepresentationService } from './gateway-visual-representation.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { VisualRepresentationResponse } from '../dto/visual-representation-response';
import { VisualRepresentationTransactionDto } from '@tc/transactions/did-visual-representation/dto/visual-representation.transaction.dto';

/**
 * Stores new visualrepresentation transactions.
 */
@ApiTags('visualRepresentation')
@UseGuards(MaintenanceGuard)
@Controller('visualrepresentation')
export class GatewayVisualRepresentationController {
  /**
   * Injects required services.
   * @param gatewayVisualRepresentationService
   */
  constructor(
    private readonly gatewayVisualRepresentationService: GatewayVisualRepresentationService,
  ) {}
  /**
   * Adds new transaction to the chain.
   * @param transaction
   */
  @Post()
  @ApiOperation({ summary: 'Adds new visualrepresentation to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: VisualRepresentationResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Id is already taken.',
  })
  async create(
    @Body() transaction: VisualRepresentationTransactionDto,
  ): Promise<VisualRepresentationResponse> {
    return this.gatewayVisualRepresentationService.addVisualRepresentation(
      transaction,
    );
  }
}
