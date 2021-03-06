import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Body,
  ConflictException,
  Controller,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CERT_ROOT_INIT } from '../../constants';
import { ClientTCP } from '@nestjs/microservices';
import { NETWORK_TCP_INJECTION } from '@tc/clients/network-client/constants';
import { NodeGuard } from '@shared/guards/node-guard.service';

/**
 * Creates root certificates, signs the values and gives public information.
 */
@ApiTags('did')
@Controller('did')
export class GenesisController {
  /**
   * Creates a RootCertController
   * @param clientNetwork
   * @param validatorDidService
   */
  constructor(
    @Inject(NETWORK_TCP_INJECTION) private readonly clientNetwork: ClientTCP,
  ) {}

  /**
   * Requests a genesis block for the given peers.
   * @param peers
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post('genesis')
  @ApiOperation({ summary: 'Creates the genesis block.' })
  @ApiResponse({
    status: 201,
    description: 'The rootCert has been successfully created.',
  })
  async requestCert(@Body() peers: string[]) {
    // TODO move this to a network client service
    return new Promise<void>((resolve, reject) => {
      this.clientNetwork.send(CERT_ROOT_INIT, peers).subscribe({
        complete: () => {
          resolve();
        },
        error: (err) => {
          reject(new ConflictException(err.message));
        },
      });
    });
  }
}
