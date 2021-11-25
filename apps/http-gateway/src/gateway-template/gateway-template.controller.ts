import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayTemplateService } from './gateway-template.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { TemplateCreationResponse } from './response';
import { TemplateTransactionDto } from '@tc/template/dto/template.transaction.dto';

/**
 * Stores new template transactions.
 */
@ApiTags('template')
@UseGuards(MaintenanceGuard)
@Controller('template')
export class GatewayTemplateController {
  /**
   * Injects required services.
   * @param gatewayTemplateService
   */
  constructor(
    private readonly gatewayTemplateService: GatewayTemplateService,
  ) {}
  /**
   * Adds new transaction to the chain.
   * @param transaction
   */
  @Post()
  @ApiOperation({ summary: 'Adds new template to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: TemplateCreationResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'The hash failed. The hash is already signed.',
  })
  async create(
    @Body() transaction: TemplateTransactionDto,
  ): Promise<TemplateCreationResponse> {
    return this.gatewayTemplateService.addTemplate(transaction);
  }
}
