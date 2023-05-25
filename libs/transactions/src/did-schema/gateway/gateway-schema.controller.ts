import {
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GatewaySchemaService } from './gateway-schema.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { SchemaResponse } from '../dto/schema-response';
import { SchemaTransactionDto } from '@tc/transactions/did-schema/dto/schema.transaction.dto';

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
    type: SchemaResponse,
  })
  @ApiResponse({
    status: 422,
    description: 'Id already taken.',
  })
  async create(
    @Body() transaction: SchemaTransactionDto,
  ): Promise<SchemaResponse> {
    return this.gatewaySchemaService.addSchema(transaction);
  }
}
