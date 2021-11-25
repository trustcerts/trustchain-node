import { Connection } from '../../../shared/connection';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import { Logger } from 'winston';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
} from '@nestjs/websockets';
import { P2PService } from '@tc/p2-p';
import { Socket } from 'socket.io';

/**
 * Describes the parameters that are send with a new socket connection.
 */
export interface HandShakeQuery {
  /**
   * unique identifier of the Client that wants to connect.
   */
  identifier: string;
  /**
   * Endpoint of the identifier. Only available if Client is a Validator.
   */
  peer: string;
}

/**
 * The BlockchainGateway handles the connections between the nodes.
 */
@WebSocketGateway({ transports: ['websocket'] })
export class BlockchainGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  /**
   * Constructor to build this Gateway
   * @param p2PService The used BlockchainConnection
   * @param httpService
   * @param logger
   */
  constructor(
    private readonly p2PService: P2PService,
    private readonly httpService: HttpService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Logs the initialization
   */
  afterInit(): any {
    this.logger.info({
      message: 'init ws server',
      labels: { source: this.constructor.name },
    });
  }

  /**
   * This method is called, when a node connects to this Gateway.
   * When a connection to a new node is established, inform the new node, that it can add the node and the
   * existing/connected validators. Then add the new connection to the nodes existing connections.
   * @param client Socket to the new node
   */
  handleConnection(client: Socket): any {
    const peer: string = (client.handshake.query as unknown as HandShakeQuery)
      .peer;
    const identifier: string = (
      client.handshake.query as unknown as HandShakeQuery
    ).identifier;
    this.logger.debug({
      message: `${identifier}: wants to connect`,
      labels: { source: this.constructor.name, identifier },
    });
    const endPoint = new Connection(this.logger, this.httpService);
    endPoint.peer = peer;
    endPoint.identifier = identifier;
    endPoint.socket = client;
    endPoint.connectionType = 'Server';
    this.p2PService.connected(endPoint).then();
  }

  /**
   * This method is called, when a node disconnects from this Gateway.
   * The connection is removed from the existing connections.
   * @param client Socket to the disconnecting node
   */
  handleDisconnect(client: Socket): any {
    const identifier = (client.handshake.query as unknown as HandShakeQuery)
      .identifier;
    if (identifier) {
      this.p2PService.disconnected(identifier);
      this.logger.info({
        message: `${identifier} is disconnected`,
        labels: { source: this.constructor.name },
      });
    } else {
      this.logger.warn({
        message: `unknown peer disconnected`,
        labels: { source: this.constructor.name },
      });
    }
  }
}
