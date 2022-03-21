import { BeforeApplicationShutdown, Inject, Injectable } from '@nestjs/common';
import { Block } from '@tc/blockchain/block/block.interface';
import {
  CONNECTION_ADDED,
  CONNECTION_CHALLENGE,
  CONNECTION_REMOVED,
  CONNECTION_VALIDATORS_REQUEST,
  CONNECTION_VALIDATORS_RESPONSE,
  ENDPOINT_LISTENING_FOR_BLOCKS,
  ENDPOINT_LISTENING_FOR_VALIDATORS,
  IS_ENDPOINT_LISTENING_FOR_BLOCKS,
  IS_ENDPOINT_LISTENING_FOR_VALIDATORS,
  WS_BLOCK,
} from '@tc/blockchain/blockchain.events';
import { Socket as ClientSocket, io } from 'socket.io-client';
import { ConfigService } from '@tc/config/config.service';
import { EventEmitter } from 'events';

import { BlockReceivedService } from './block-received/block-received.service';
import { BlockchainSyncService } from '@tc/p2-p/blockchain-sync/blockchain-sync.service';
import { ConnectDto } from '@tc/p2-p/dto/connect.dto';
import { Connection } from '@shared/connection';
import { DidIdCachedService } from '@tc/did-id/cached/did-id-cached.service';
import { Gauge } from 'prom-client';
import { HandshakeService } from '@tc/p2-p/handshake/handshake.service';
import { HttpService } from '@nestjs/axios';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Logger } from 'winston';
import { PersistClientService } from '@tc/persist-client';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { RoleManageType } from '@tc/did-id/constants';
import { Socket as ServerSocket } from 'socket.io';
import { SignatureService } from '@tc/blockchain/signature/signature.service';
import { lastValueFrom } from 'rxjs';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { wait } from '@shared/helpers';

/**
 * Handles the connections to the blockchain.
 */
@Injectable()
export class P2PService implements BeforeApplicationShutdown {
  /**
   * Pool of connections.
   */
  public connections: Connection[] = [];

  /**
   * Emits events for changing connections.
   */
  public connectionChanges = new EventEmitter();

  /**
   * peers to which is a connection is built up right now.
   */
  connecting: string[] = [];

  /**
   * Flag when the service should be reset.
   */
  reset = false;

  /**
   * Flag when the serve should be shutdown;
   */
  shutdown = false;

  /**
   * Queue for incoming blocks
   */
  private queue: Block[] = [];

  /**
   * Constructor to add a P2PService
   * @param httpService
   * @param configService
   * @param networkService
   * @param blockchainSyncService
   * @param handshakeService
   * @param didCachedService
   * @param persistClientService
   * @param signatureService
   * @param walletClientService
   * @param logger
   * @param promConnections
   */
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly networkService: BlockReceivedService,
    private readonly blockchainSyncService: BlockchainSyncService,
    private readonly handshakeService: HandshakeService,
    private readonly didCachedService: DidIdCachedService,
    private readonly persistClientService: PersistClientService,
    private readonly signatureService: SignatureService,
    @Inject('winston') private readonly logger: Logger,
    @InjectMetric('connections') private promConnections: Gauge<string>,
  ) {
    this.connectionChanges.on(
      CONNECTION_REMOVED,
      async (connection: Connection) => {
        if (this.shutdown) {
          return;
        }
        if (this.connections.length === 0) {
          this.logger.error({
            message: `lost connection to all nodes.`,
            labels: { source: this.constructor.name },
          });
          if (this.configService.getBoolean('RECONNECT')) {
            this.logger.info({
              message: `try to reconnect to the network.`,
              labels: { source: this.constructor.name },
            });
            // wait some time to parse the own reset event
            setTimeout(() => {
              if (this.reset) {
                this.reset = false;
              } else {
                this.init().then();
              }
            }, 2000);
          }
        } else if (this.configService.getBoolean('RECONNECT')) {
          const endpoint = new Connection(this.logger, this.httpService);
          // TODO peer is undefined when connection was closed
          endpoint.peer = connection.peer;
          this.logger.info({
            message: `try to reconnect to ${endpoint.peer}`,
            labels: { source: this.constructor.name },
          });
          // wait a bit since a reset event could be in progress
          if (this.reset) {
            await wait(2000);
            this.checkConnection(endpoint).then();
          }
        }
      },
    );
  }

  /**
   * Fired before the application shuts down.
   * @param signal
   */
  beforeApplicationShutdown(signal: string) {
    this.shutdown = true;
    this.logger.info({
      message: signal,
      labels: { source: this.constructor.name },
    });
  }

  /**
   * Returns all urls of all active Validator-connections
   */
  get validatorConnections(): Connection[] {
    return this.connections.filter(
      (connection) => connection.type === RoleManageType.Validator,
    );
  }

  /**
   * Checks if own node is available for others if the node uses https. Required for e.g. lets encrypt proxy where the generation of the certificate
   * takes some time.
   * @private
   */
  public checkOwnAvailability(): Promise<void> {
    const connection = new Connection(this.logger, this.httpService);
    connection.peer = this.ownPeer;
    return connection.waitUntilHealthy();
  }

  /**
   * Initializes the connection to the validators. Only connects if the key is signed or a parameter is passed, that says that it is.
   */
  async init(node?: string) {
    const endpoint = new Connection(this.logger, this.httpService);
    // node is passed, so connect to it.
    if (node) {
      endpoint.peer = node;
      this.checkConnection(endpoint).then();
    } else {
      // find a node to connect to
      this.getFirstConnection().then(
        (validator) => {
          endpoint.peer = validator;
          this.checkConnection(endpoint).then();
        },
        () => {
          this.logger.warn({
            message: 'no endpoint reachable',
            labels: { source: this.constructor.name },
          });
        },
      );
    }
  }

  /**
   * Returns the first element from the list that is reachable.
   * @private
   */
  private async getFirstConnection(): Promise<string> {
    const validators: string[] =
      this.configService.getConfig('VALIDATORS') ?? [];
    for (let i = 0; i < validators.length; i++) {
      const connection = new Connection(this.logger, this.httpService);
      connection.peer = validators[i];
      const available = await connection
        .waitUntilHealthy()
        .then(() => {
          return connection.peer;
        })
        .catch((err: Error) => {
          this.logger.warn({
            message: `${err.message}`,
            labels: { source: this.constructor.name },
          });
          // TODO evaluate if removing the connection is the best way. If the other node is just offline the connection will be lost.
          // remove node since it was unreachable.
          this.configService.setConfig(
            'VALIDATORS',
            validators.filter((validator) => validator !== connection.peer),
          );
        });
      if (available) {
        return connection.peer;
      }
    }
    return Promise.reject();
  }

  /**
   * Returns the connection for a given peer.
   * @param peer
   */
  getConnectionByPeer(peer: string): Connection | undefined {
    return this.connections.find((connection) => connection.peer === peer);
  }

  /**
   * Adds a new connection consisting of a given socket, peer and identifier.
   * @param endpoint
   */
  addConnection(endpoint: Connection) {
    return this.didCachedService
      .getRole(endpoint.identifier!)
      .then(
        (roles) => roles[0],
        () => {
          // return Validator because the blockchain is empty and the first connection is always a Validator
          return RoleManageType.Validator;
        },
      )
      .then((type: RoleManageType) => {
        endpoint.type = type;
        if (
          !this.connections.find(
            (existingConnection) =>
              existingConnection.identifier === endpoint.identifier,
          )
        ) {
          this.connections.push(endpoint);
          this.promConnections.set(
            {
              node: endpoint.identifier,
              type: endpoint.type,
              peer: endpoint.peer,
            },
            1,
          );
          this.connecting = this.connecting.filter(
            (connectionPeer) => connectionPeer !== endpoint.peer,
          );
        }
      });
  }

  /**
   * Removes the connection to the given socket.
   * @param identifier
   */
  removeConnection(identifier: string) {
    let removedConnection;
    this.connections = this.connections.filter((connection) => {
      if (connection.identifier !== identifier) {
        return true;
      } else {
        this.promConnections.set(
          {
            node: connection.identifier,
            type: connection.type,
            peer: connection.peer,
          },
          0,
        );
        this.logger.debug({
          message: `${identifier}: removed from connection array.`,
          labels: { source: this.constructor.name, identifier },
        });
        removedConnection = connection;
        return false;
      }
    });
    if (removedConnection) {
      this.connectionChanges.emit(CONNECTION_REMOVED, removedConnection);
    }
  }

  /**
   * Checks if the node or the other one has to establish the connection. If own node is not a Validator the connection will be opened. If both nodes
   * are validators they share their identifiers to compare them. This eliminates a double connection because both know who is responsible for the
   * connection build up.
   * @param endpoint
   */
  async checkConnection(endpoint: Connection) {
    if (this.alreadyConnected(endpoint)) {
      return;
    }
    return endpoint.waitUntilHealthy().then(
      async () => {
        // TODO outsource in endpoint class
        const url = `${await endpoint.getHttpEndpoint()}/p2p`;
        // TODO is_validator should not be passed by a config but set by a value
        if (this.configService.getBoolean('IS_VALIDATOR')) {
          this.logger.debug({
            message: `${endpoint.peer}: ask for identifier for local compare.`,
            labels: { source: this.constructor.name, peer: endpoint.peer },
          });
          // send more information, maybe the other node has to establish the connection.
          const response = await lastValueFrom(
            this.httpService.post<string>(
              url,
              {
                identifier: this.configService.getConfig('IDENTIFIER'),
                peer: this.ownPeer,
              },
              {
                headers: {
                  Authorization: `Bearer ${this.configService.getString(
                    'NETWORK_SECRET',
                  )}`,
                },
              },
            ),
          );
          endpoint.identifier = response.data;
        } else {
          this.logger.debug({
            message: `${endpoint.peer}: ask for identifier`,
            labels: { source: this.constructor.name, peer: endpoint.peer },
          });
          // just request the identifier
          const response = await lastValueFrom(
            this.httpService.get<string>(url, {
              headers: {
                Authorization: `Bearer ${this.configService.getString(
                  'NETWORK_SECRET',
                )}`,
              },
            }),
          );
          endpoint.identifier = response.data;
        }
        this.logger.debug({
          message: `${endpoint.peer}: is ${endpoint.identifier}`,
          labels: { source: this.constructor.name, peer: endpoint.peer },
        });
        return this.validateConnectionRequest(endpoint);
      },
      (e) => {
        this.logger.error({
          message: `${e} `,
          labels: { source: this.constructor.name, peer: endpoint.peer },
        });
      },
    );
  }

  /**
   * Validates the connection request after the node is healthy.
   * @param params
   */
  async handleConnectionRequest(params: ConnectDto) {
    const endpoint = new Connection(this.logger, this.httpService);
    endpoint.peer = params.peer;
    endpoint.identifier = params.identifier;
    if (this.alreadyConnected(endpoint)) {
      return;
    }
    this.logger.debug({
      message: `${endpoint.identifier}: got a request, check it`,
      labels: { source: this.constructor.name, peer: endpoint.peer },
    });

    endpoint.waitUntilHealthy().then(
      () => {
        this.validateConnectionRequest(endpoint);
      },
      (e) => {
        this.logger.error({
          message: `${e} `,
          labels: { source: this.constructor.name, peer: endpoint.peer },
        });
      },
    );
  }

  /**
   * Checks if the node is already connected to the given peer.
   * @param endpoint
   */
  public alreadyConnected(endpoint: Connection) {
    if (
      this.connecting.includes(endpoint?.peer) ||
      this.getConnectionByPeer(endpoint?.peer) ||
      // TODO this is only relevant if the node is a Validator
      this.isOwnPeer(endpoint?.peer)
    ) {
      this.logger.debug({
        message: `already connected to ${endpoint.peer}`,
        labels: { source: this.constructor.name, peer: endpoint.peer },
      });
      return true;
    }
    return false;
  }

  /**
   * Validates which of the two nodes has to establish the connection and who has to wait.
   * @param endpoint
   */
  async validateConnectionRequest(endpoint: Connection) {
    if (this.alreadyConnected(endpoint)) {
      return;
    }
    // don't compare if own node is not a Validator since layer two always establish a connection.
    if (!this.configService.getBoolean('IS_VALIDATOR')) {
      await this.connectToValidator(endpoint);
      return;
    }
    const compareResult = endpoint.identifier!.localeCompare(
      this.configService.getConfig('IDENTIFIER'),
    );
    this.logger.debug({
      message: `${endpoint.identifier!}: compare result ${compareResult}`,
      labels: { source: this.constructor.name, peer: endpoint.peer },
    });
    if (compareResult === 0) {
      this.logger.error({
        message: `${endpoint.identifier!} has identical identifier`,
        labels: { source: this.constructor.name, peer: endpoint.peer },
      });
    } else if (compareResult > 0) {
      await this.connectToValidator(endpoint);
    } else {
      this.logger.info({
        message: `${endpoint.identifier!} will establish connection`,
        labels: { source: this.constructor.name, peer: endpoint.peer },
      });
      // TODO remove timeout to reduce reconnection attempts
      // setTimeout(() => {
      //   this.checkConnection(endpoint);
      // }, 1000 * 10);
    }
  }

  /**
   * Connects to the given address.
   * @param endpoint
   */
  async connectToValidator(endpoint: Connection) {
    this.logger.debug({
      message: `connect to ${endpoint.identifier!}`,
      labels: { source: this.constructor.name, peer: endpoint.peer },
    });
    this.connecting.push(endpoint.peer);
    const values: any = {
      identifier: this.configService.getConfig('IDENTIFIER'),
    };

    if (this.configService.getBoolean('IS_VALIDATOR')) {
      // variable is for lets encrypt so you don't have to set it twice
      values.peer = this.ownPeer;
    }
    const client = io(await endpoint.getWsEndpoint(), {
      // set to true since the Client and server roles are fixed by the identifier comparison.
      reconnection: false,
      rejectUnauthorized: this.configService.getBoolean('REJECT_UNAUTHORIZED'),
      transports: ['websocket'],
      query: values,
    });
    client.on('connect', () => {
      endpoint.socket = client;
      endpoint.connectionType = 'Client';
      this.connected(endpoint);
    });

    client.on('connect_error', (err: any) => {
      this.logger.warn({
        message: `failed to connect to ${endpoint.peer}: ${JSON.stringify(
          err.data,
        )}`,
        labels: { source: this.constructor.name, peer: endpoint.peer },
      });
      // TODO if this node should connect maybe try to reconnect
      // TODO check where are other positions where the connection is closed but element is not removed yet.
      this.connecting = this.connecting.filter(
        (connectionPeer) => connectionPeer !== endpoint.peer,
      );
    });

    client.on('disconnect', (reason: string) =>
      this.disconnected(endpoint.identifier!, reason),
    );
  }

  /**
   * Logs when a node disconnects. Removes it from the array.
   * @param identifier
   */
  public disconnected(identifier: string, reason?: string) {
    // use identifier since gateways and observers have no peer
    this.logger.info({
      message: `${identifier} disconnected: ${reason}`,
      labels: { source: this.constructor.name, identifier },
    });
    this.removeConnection(identifier);
  }

  /**
   * Closes a connection by id and removed it from the connection array.
   * @param id
   */
  closeConnection(id: string) {
    this.connections = this.connections.filter((connection) => {
      if (connection.identifier !== id) {
        return true;
      }
      this.logger.debug({
        message: `close connection to ${connection.identifier}, certificate revoked`,
        labels: { source: this.constructor.name, process: 'p2p' },
      });
      connection.disconnect();
      return false;
    });
  }

  /**
   * Closes all connections. Required for a reset of the node.
   */
  closeAll() {
    this.logger.debug({
      message: 'close all connections',
      labels: { source: this.constructor.name, process: 'p2p' },
    });
    this.connections.forEach((connection) => connection.disconnect());
    this.connections = [];
    this.connecting = [];
  }

  /**
   * Places necessary listeners on the given socket.
   * @param endpoint
   */
  public async connected(endpoint: Connection) {
    // answer to the challenge
    endpoint.socket.on(
      CONNECTION_CHALLENGE,
      async (challenge: string, callBack) => {
        const response = await this.handshakeService.createResponse(
          endpoint.identifier!,
          challenge,
        );
        callBack(response);
      },
    );

    // send challenge
    if ((await this.persistClientService.getBlockCounter()) === 0) {
      // has no blockchain or pki to validate the challenge, so don't send one
      this.logger.debug({
        message: "don't add a challenge since bc is empty",
        labels: { source: this.constructor.name, peer: endpoint.peer },
      });
      // wait one second so the Validator can register the required events.
      await this.addConnection(endpoint);
      setTimeout(() => {
        endpoint.type = RoleManageType.Validator;
        this.addListeners(endpoint);
      }, 1000);
    } else {
      // has blockchain, validate
      this.handshakeService.createChallenge(endpoint).then(
        async () => {
          await this.addConnection(endpoint);
          this.logger.debug({
            message: `connected to ${endpoint.identifier}`,
            labels: {
              source: this.constructor.name,
              identifier: endpoint.identifier,
            },
          });
          await this.addListeners(endpoint);
        },
        () => {
          this.connecting = this.connecting.filter(
            (peer) => peer !== endpoint.peer,
          );
          endpoint.disconnect();
        },
      );
    }
  }

  /**
   * Adds listeners after the handshake was successful.
   * @param endpoint
   */
  private async addListeners(endpoint: Connection) {
    // wait until chain is synced up
    if (!endpoint.type) {
      const connection = this.connections.find(
        (connection) => connection.identifier === endpoint.identifier,
      );
      if (connection) {
        endpoint.type = connection.type;
      }
    }
    this.blockchainSyncService.response(endpoint.socket);
    endpoint.socket.on(CONNECTION_VALIDATORS_REQUEST, (data, callback) => {
      //TODO why there is null in connection
      if (endpoint.peer === null) {
        throw new Error('found peer with null value');
      }
      const urls = this.validatorConnections
        .filter(
          (connection) =>
            connection.identifier !== endpoint.identifier && connection.peer,
        )
        .map((connection) => connection.peer);
      this.logger.info({
        message: `send ${JSON.stringify(urls)} to ${endpoint.identifier}`,
        labels: {
          source: this.constructor.name,
          identifier: endpoint.identifier,
        },
      });
      callback(urls);
    });
    endpoint.socket.once(IS_ENDPOINT_LISTENING_FOR_BLOCKS, () => {
      endpoint.socket.emit(ENDPOINT_LISTENING_FOR_BLOCKS);
    });
    if (endpoint.type === RoleManageType.Validator) {
      const validators: string[] =
        this.configService.getConfig('VALIDATORS') ?? [];
      if (validators.indexOf(endpoint.peer) === -1 && endpoint.peer !== null) {
        validators.push(endpoint.peer);
        this.configService.setConfig('VALIDATORS', validators.sort());
      }
      //wait that until all endpoints are registered
      await this.waitUntilReady(endpoint, 'blocks');

      await this.blockchainSyncService.request(endpoint);

      this.logger.debug({
        message: `request missing validators`,
        labels: { source: this.constructor.name, identifier: endpoint },
      });

      // don't mix listener with emit since a new Validator can connect to the network after this node was started.
      endpoint.socket.on(
        CONNECTION_VALIDATORS_RESPONSE,
        this.responseValidators.bind(this),
      );

      endpoint.socket.once(IS_ENDPOINT_LISTENING_FOR_VALIDATORS, () => {
        endpoint.socket.emit(ENDPOINT_LISTENING_FOR_VALIDATORS);
      });
      await this.waitUntilReady(endpoint, 'validators');
      // ask for validators
      const peers = await this.requestValidators(endpoint.socket);
      this.logger.debug({
        message: `got validators: ${JSON.stringify(peers)}`,
        labels: {
          source: this.constructor.name,
          identifier: endpoint.identifier,
        },
      });
      this.responseValidators(peers).then();

      endpoint.socket.on(WS_BLOCK, async (block: Block) => {
        const errors = await validateSync(plainToClass(Block, block));
        if (errors.length > 0) {
          this.logger.error({
            message: `received block is invalid: ${JSON.stringify(errors)}`,
            labels: {
              source: this.constructor.name,
              identifier: endpoint.identifier,
            },
          });
          return;
        }
        // Check index
        const blockCount = await this.persistClientService.getBlockCounter();
        if (block.index - blockCount > 1) {
          // put in queue
          this.queue.push(block);
          // Were already blocks in queue?
          if (this.queue.length == 1) {
            this.logger.warn({
              message: `request missing blocks: ${blockCount + 1} to ${
                block.index - 1
              }`,
              labels: {
                source: this.constructor.name,
                identifier: endpoint.identifier,
              },
            });
            // Get the missing blocks (and persist and parse them)
            await this.blockchainSyncService.requestMissingBlocks(
              endpoint.socket,
              blockCount + 1,
              block.index - blockCount - 1,
            );
            // do for every block in queue:
            for (let i = 0; i < this.queue.length; i++) {
              this.processBlock(endpoint, this.queue[i]);
            }
          }
        } else if (block.index <= blockCount) {
          this.logger.warn({
            message: `Block number is too small, got ${
              block.index
            } instead of ${blockCount + 1}`,
            labels: {
              source: this.constructor.name,
              identifier: endpoint.identifier,
            },
          });
        } else {
          this.processBlock(endpoint, block);
        }
      });
    } else {
      endpoint.socket.once(IS_ENDPOINT_LISTENING_FOR_VALIDATORS, () => {
        endpoint.socket.emit(ENDPOINT_LISTENING_FOR_VALIDATORS);
      });
      this.logger.debug({
        message: `${endpoint.identifier} connected, don't ask for other connections or blocks`,
        labels: {
          source: this.constructor.name,
          identifier: endpoint.identifier,
        },
      });
    }
    this.connectionChanges.emit(CONNECTION_ADDED, endpoint);
  }

  /**
   * Validate and add block
   * @param endpoint which sent the block
   * @param block block to validate and add
   */
  private processBlock(endpoint: Connection, block: Block) {
    this.signatureService.validateSignatures(block).then(
      () => this.networkService.addBlock(block),
      (e) => {
        this.logger.error({
          message: JSON.stringify(block, null, 4),
          labels: {
            source: this.constructor.name,
            identifier: endpoint.identifier,
            rejected: true,
          },
        });
        this.logger.error({
          message: e,
          labels: {
            source: this.constructor.name,
            identifier: endpoint.identifier,
          },
        });
      },
    );
  }

  /**
   * Repeats request until the other endpoints signals that it is ready for the next stage.
   * @param endpoint
   * @param type
   * @private
   */
  private waitUntilReady(endpoint: Connection, type: string): Promise<void> {
    const emitter: any = {
      blocks: IS_ENDPOINT_LISTENING_FOR_BLOCKS,
      validators: IS_ENDPOINT_LISTENING_FOR_VALIDATORS,
    };
    const listener: any = {
      blocks: ENDPOINT_LISTENING_FOR_BLOCKS,
      validators: ENDPOINT_LISTENING_FOR_VALIDATORS,
    };
    return new Promise((resolve) => {
      endpoint.socket.once(listener[type], () => {
        clearInterval(interval);
        resolve();
      });
      const interval = setInterval(() => {
        endpoint.socket.emit(emitter[type]);
      }, 100);
    });
  }

  /**
   * Requests more known peers from the connected node.
   * @param client
   */
  private requestValidators(
    client: ClientSocket | ServerSocket,
  ): Promise<string[]> {
    return new Promise((resolve) => {
      client.emit(CONNECTION_VALIDATORS_REQUEST, null, (peers: []) => {
        resolve(peers);
      });
    });
  }

  /**
   * Loops over the given peers and connects to them synchronously to avoid any race conditions, e.g. during blockchain sync up.
   * @param peers
   */
  private async responseValidators(peers: string[]) {
    for (const peer of peers) {
      // TODO check if connection should be sync or async
      const endpoint = new Connection(this.logger, this.httpService);
      endpoint.peer = peer;
      await this.checkConnection(endpoint);
    }
  }

  /**
   * Returns own peer, can be a domain or an ip port combination. Can not just use localhost:3000 since for a healthy check if the https connection
   * is available for others the node has to known his external name.
   */
  get ownPeer() {
    return this.configService.getString('OWN_PEER');
  }

  /**
   * Checks if the given peer is the one from this node.
   * @param peer
   */
  private isOwnPeer(peer: string) {
    return peer.indexOf(this.ownPeer) >= 0;
  }
}
