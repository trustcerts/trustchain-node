import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewayTemplateService } from './gateway-template.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { TemplateResponse } from './response';
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
    type: TemplateResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Id is already taken.',
  })
  async create(
    @Body() transaction: TemplateTransactionDto,
  ): Promise<TemplateResponse> {
    return this.gatewayTemplateService.addTemplate(transaction);
  }
}
