import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateDidDto } from '../../../shared/create-did.dto';
import { DidCreationResponse } from './responses';
import { DidTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { GatewayDidService } from './gateway-did.service';
import { InviteRequest } from '@tc/invite/schemas/invite-request.schema';
import { InviteService } from '@tc/invite';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { NodeGuard } from '../../../shared/node-guard.service';

/**
 * Endpoints to administrate did documents.
 */
@ApiTags('did')
@UseGuards(MaintenanceGuard)
@Controller('did')
export class GatewayDidController {
  /**
   * Injects required services.
   * @param gatewayDidService
   * @param inviteService
   */
  constructor(
    private readonly gatewayDidService: GatewayDidService,
    private readonly inviteService: InviteService,
  ) {}

  /**
   * Adds new did document to the chain.
   * @param transaction
   */
  @ApiOperation({ summary: 'Adds new did document to the chain.' })
  @ApiCreatedResponse({
    description: 'did document was created.',
  })
  @Post()
  store(@Body() transaction: DidTransactionDto) {
    return this.gatewayDidService.updateDid(transaction);
  }

  /**
   * Generates an invite for a new Client.
   * @param invite
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('invite')
  @ApiOperation({
    summary: 'Generates an invite for a new Client',
  })
  async invite(@Body() invite: InviteRequest): Promise<InviteRequest> {
    return this.inviteService.createInvite(invite);
  }

  /**
   * Signs the public key of the Client.
   * @param createCert
   */
  @Post('create')
  @ApiOperation({
    summary: 'Signs the public key of the Client.',
  })
  @ApiCreatedResponse({
    description: 'The hash was successful persisted.',
    type: DidCreationResponse,
  })
  async create(@Body() createCert: CreateDidDto): Promise<DidCreationResponse> {
    const invite = await this.inviteService.isValidInvite(
      createCert.identifier,
      createCert.secret,
    );
    return this.gatewayDidService.createDid(createCert, invite.role);
  }

  /**
   * Resolves the name to a did.
   */
  @Get('resolve/:id')
  @ApiOperation({
    summary: 'Resolves the name to a given did that was created by this node.',
  })
  resolve(@Param('id') id: string) {
    return this.inviteService.resolve(id);
  }
}
