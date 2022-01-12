import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@tc/config';
import { ConnectDto } from '@tc/p2-p/connect.dto';
import { EventPattern, MessagePattern, Transport } from '@nestjs/microservices';
import { NEW_IDENTIFIER } from 'libs/clients/wallet-client/src/constants';
import { NetworkGuard } from '@shared/network-guard.service';
import { NodeGuard } from '@shared/node-guard.service';
import { P2PService } from './p2-p.service';
import {
  SYSTEM_INIT,
  VALIDATE_CONNECTIONS,
} from 'libs/clients/event-client/src/constants';
import { VALIDATOR_ENDPOINT } from '@tc/p2-p/constant';

/**
 * Controller to send requests to the peer 2 peer service.
 */
@ApiTags('p2p')
@Controller('p2p')
export class P2PController {
  constructor(
    private readonly p2PService: P2PService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Will init the node. Normally this endpoint is called after the node got a certificate to participate with a network.
   */
  @EventPattern(SYSTEM_INIT, Transport.REDIS)
  initNode(node: string) {
    this.p2PService.init(node).then();
  }

  /**
   * Sets a new identifier that was generated.
   * @param id
   */
  @EventPattern(NEW_IDENTIFIER, Transport.REDIS)
  setIdentifier(id: string) {
    this.configService.setConfig('IDENTIFIER', id);
  }

  /**
   * Returns all known Validator endpoints.
   */
  @MessagePattern(VALIDATOR_ENDPOINT, Transport.TCP)
  knownValidatorEndpoints() {
    return this.p2PService.validatorConnections.map(
      (connection) => connection.peer,
    );
  }

  /**
   * Closes a possible connection with this identifier since it's certificate was
   * removed.
   * @param id
   */
  @EventPattern(VALIDATE_CONNECTIONS, Transport.REDIS)
  closeConnection(id: string) {
    this.p2PService.closeConnection(id);
  }

  /**
   * Returns the active connections.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Get('connections')
  @ApiOperation({ summary: 'Returns the active connections.' })
  @ApiResponse({
    status: 200,
    description: 'The active connections',
    schema: {
      example: [{ peer: '123.456.789.000:1000', identifier: 'Identifier1' }],
    },
  })
  connections() {
    return this.p2PService.connections.map((connection) => {
      return {
        peer: connection.peer,
        identifier: connection.identifier,
      };
    });
  }

  /**
   * Returns own identifier for connection build up. Checks if this node has to connect to the node.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Post()
  @ApiOperation({
    summary:
      'Returns own identifier for connection build up. Checks if this node has to connect to the node.',
  })
  @ApiResponse({ status: 201, description: 'Own identifier.', type: String })
  preConnectValidator(@Body() params: ConnectDto) {
    this.p2PService.handleConnectionRequest(params).then();
    return this.configService.getConfig('IDENTIFIER');
  }

  /**
   * Returns own identifier for connection build up.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Get()
  @ApiOperation({ summary: 'Returns own identifier for connection build up.' })
  @ApiResponse({ status: 200, description: 'Own identifier.', type: String })
  preConnect() {
    return this.configService.getConfig('IDENTIFIER');
  }

  /**
   * Resets the connecting array so a node can try to connect again.
   */
  @ApiBearerAuth()
  @UseGuards(NodeGuard)
  @Post()
  @ApiOperation({ summary: 'Resets the connecting array' })
  @ApiResponse({ status: 201 })
  resetConnecting() {
    this.p2PService.connecting = [];
  }
}
