import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientTCP } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { CreateDidDto } from '../../../../libs/transactions/did/src/dto/create-did.dto';
import { InviteRequest } from '@tc/invite/schemas/invite-request.schema';
import { InviteService } from '@tc/invite/invite.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { NETWORK_TCP_INJECTION } from '@tc/network-client/constants';
import { NetworkGuard } from '../../../shared/guards/network-guard.service';
import { NodeGuard } from '../../../shared/guards/node-guard.service';
import { VALIDATOR_ENDPOINT } from '@tc/p2-p/constant';
import { ValidatorDidService } from './validator-did.service';

/**
 * Endpoint to request or revoke an gateway cert.
 */
@ApiTags('did')
@UseGuards(MaintenanceGuard)
@Controller('did')
export class ValidatorDidController {
  /**
   * Constructor to add a ValidatorPkiController
   * @param validatorDidService given ValidatorPkiService to use.
   * @param inviteService
   * @param configService
   * @param clientNetwork
   */
  constructor(
    private readonly validatorDidService: ValidatorDidService,
    private readonly inviteService: InviteService,
    private readonly configService: ConfigService,
    @Inject(NETWORK_TCP_INJECTION) private clientNetwork: ClientTCP,
  ) {}

  /**
   * Creates an invite to generate a new did.
   * @param invite
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('invite')
  @ApiOperation({
    summary: 'Generates an invite for a new node',
  })
  async invite(@Body() invite: InviteRequest): Promise<InviteRequest> {
    return this.inviteService.createInvite(invite);
  }

  /**
   * Signs the public key of a Observer or gateway.
   * @param createCert
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Signs the public key of the gateway.',
  })
  async create(@Body() createCert: CreateDidDto) {
    const invite = await this.inviteService.isValidInvite(
      createCert.identifier,
      createCert.secret,
    );
    await this.validatorDidService.createDid(createCert, invite.role);
    // return the endpoint the node can use to connect to the system
    return this.clientNetwork.send<string[]>(VALIDATOR_ENDPOINT, {});
  }

  /**
   * Resolves the name of a did
   * @param id
   */
  @Get('resolve/:id')
  @ApiOperation({
    summary:
      'Resolves the name to a given did that was created by this node. If it is the own id the config value will be returned.',
  })
  resolve(@Param('id') id: string): Promise<{ name: string }> {
    if (id === this.configService.getConfig('IDENTIFIER')) {
      return Promise.resolve({
        name: this.configService.getString('IDENTIFIER'),
      });
    }
    return this.inviteService.resolve(id).then((el) => {
      if (!el) {
        return new NotFoundException('did not found');
      }
      return el;
    });
  }
}
