import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewaySchemaService } from './gateway-schema.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaCreationResponse } from './response';
import { SchemaTransactionDto } from '@tc/schema/dto/schema.transaction.dto';

/**
 * Stores new schema transactions.
 */
@ApiTags('schema')
@UseGuards(MaintenanceGuard)
@Controller('schema')
export class GatewaySchemaController {
  /**
   * Injects required services.
   * @param gatewaySchemaService
   */
  constructor(private readonly gatewaySchemaService: GatewaySchemaService) {}
  /**
   * Adds new transaction to the chain.
   * @param transaction
   */
  @Post()
  @ApiOperation({ summary: 'Adds new schema to the chain.' })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: SchemaCreationResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Id already taken.',
  })
  async create(
    @Body() transaction: SchemaTransactionDto,
  ): Promise<SchemaCreationResponse> {
    return this.gatewaySchemaService.addSchema(transaction);
  }
}
