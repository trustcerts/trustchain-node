import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Block } from '@tc/blockchain/block/block.interface';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CERT_ROOT_INIT } from '@tc/event-client/constants';
import { GenesisService } from './genesis.service';
import { MessagePattern, RpcException, Transport } from '@nestjs/microservices';
import { NetworkGuard } from '../../../shared/guards/network-guard.service';
import { P2PService } from '@tc/p2-p';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';

/**
 * Creates root certificates, signs the values and gives public information.
 */
@ApiTags('did')
@Controller('did')
export class GenesisController {
  /**
   * Creates a RootCertController
   * @param rootCertService
   * @param walletService
   * @param p2PService
   */
  constructor(
    private readonly rootCertService: GenesisService,
    private readonly p2PService: P2PService,
  ) {}

  /**
   * Requests a genesis block for the given peers. Returns the transaction
   * object that can be handled as a normal transaction to get persisted.
   * @param peers
   */
  @MessagePattern(CERT_ROOT_INIT, Transport.TCP)
  requestCert(peers: string[]) {
    return this.rootCertService
      .requestGenesisBlock(peers)
      .catch((err: Error) => {
        return new RpcException(err.message);
      });
  }

  /**
   * Returns a self signed transactions to be persisted in the genesis block.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Get('self')
  @ApiOperation({ summary: 'self signed certificate' })
  async selfSigned() {
    return this.rootCertService.getSelfSigned();
  }

  /**
   * Sign the proposed block that will be used as the genesis block.
   * @param block
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Post('sign')
  @ApiOperation({ summary: 'sign the genesis block' })
  async signGenesis(@Body() block: ProposedBlock) {
    return this.rootCertService.signBlock(block);
  }

  /**
   * Init the process.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Post('init')
  @ApiOperation({
    summary: 'Inits the process',
  })
  async init(@Query('node') node: string, @Body() block: Block) {
    await this.rootCertService.parseGenesisBlock(block);
    this.p2PService.init(node).then();
  }
}
