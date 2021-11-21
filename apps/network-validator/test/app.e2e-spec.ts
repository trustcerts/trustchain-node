import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NetworkValidatorModule } from '../src/network-validator.module';
import { ClientRedis } from '@nestjs/microservices';
import * as request from 'supertest';
import { addRedisEndpoint } from '@shared/main-functions';
import * as fs from 'fs';
import { ConfigService } from '@tc/config/config.service';
import { Connection } from '@shared/connection';
import { Logger } from 'winston';
import { P2PService } from '@tc/p2-p/p2-p.service';
import {
  REDIS_INJECTION,
  SYSTEM_RESET,
  TRANSACTION_CREATED,
} from '@tc/event-client/constants';
import { wait } from '@shared/helpers';
import {
  createWSServer,
  createDidForTesting,
  setBlock,
  sendBlock,
  closeServer,
} from '@test/helpers';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { WS_TRANSACTION } from '@tc/blockchain/blockchain.events';
import { WalletClientService } from '@tc/wallet-client/wallet-client.service';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { Did } from '@trustcerts/sdk';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { RoleManageAddEnum } from '@tc/did/constants';
import { HttpService } from '@nestjs/axios';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let httpService: HttpService;
  let logger: Logger;
  let p2PService: P2PService;
  let clientRedis: ClientRedis;
  let walletClientService: WalletClientService;
  let didCachedService: DidCachedService;
  let didTransaction: { did: Did; transaction: TransactionDto };

  beforeAll(async () => {
    process.env.OWN_PEER = 'network:3000'
    process.env.NETWORK_SECRET = 'iAmJustASecret';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NetworkValidatorModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();

    walletClientService = app.get(WalletClientService);
    didCachedService = app.get(DidCachedService);
    clientRedis = app.get<ClientRedis>(REDIS_INJECTION);
    p2PService = app.get(P2PService);

    didTransaction = await createDidForTesting(
      walletClientService,
      didCachedService,
    );
    sendBlock(setBlock([didTransaction.transaction], 1), clientRedis, true);
  }, 15000);

  it('Returns the type of the node and the service that was exposed', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      serviceType: 'network',
      nodeType: 'validator',
    });
  });

  it('Health', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('should Checks if the node has amount of Validator', async () => {
    const connection = new Connection(logger, httpService);
    connection.type = RoleManageAddEnum.Validator;
    await p2PService.addConnection(connection);
    await request(app.getHttpServer())
      .get('/mashed?amount=1')
      .set('authorization', 'Bearer ' + process.env.NETWORK_SECRET)
      .expect(200);
    connection.disconnect;
    p2PService.removeConnection(connection.identifier);
  });

  it('should add a new Transaction', async () => {
    return new Promise(async (resolve) => {
      // Create a connection
      const connection = new Connection(logger, httpService);
      // Create a server
      const server: Server = await createWSServer(4000);
      //add a web socket to the server
      connection.socket = io('ws://localhost:4000');
      // listen for connection
      server.on('connection', (clientConnection) => {
        clientConnection.on(WS_TRANSACTION, (val: any) => {
          expect(val).toEqual(didTransaction.transaction);
          // terminate connection
          connection.disconnect();
          // remove the identifier from P2P service
          p2PService.removeConnection(connection.identifier);
          // close the websocket server
          server.disconnectSockets(true)
          closeServer(server);
          resolve(true);
        });
      });
      connection.socket.on('connect', async () => {
        p2PService.addConnection(connection);
        didTransaction = await createDidForTesting(
          walletClientService,
          didCachedService,
        );
        await sendBlock(
          setBlock([didTransaction.transaction], 1),
          clientRedis,
          true,
        );
        clientRedis.emit(TRANSACTION_CREATED, didTransaction.transaction);
      });
    });
  }, 10000);

  it('should reset the service', async () => {
    return new Promise(async (resolve) => {
      // create a new Connection
      const connection = new Connection(logger, httpService);
      const server: Server = await createWSServer(4000);
      connection.socket = io('ws://localhost:4000');
      // add the connection to the peer to peer connections
      p2PService.connections.push(connection);
      // check the connections before
      expect(p2PService.connections.length).toBe(1);
      clientRedis.emit(SYSTEM_RESET, {});
      await wait(1500);
      expect(p2PService.connections.length).toBe(0);
      closeServer(server);
      resolve(true);
    });
  }, 10000);

  afterAll(async () => {
    await wait(5000)
    fs.rmdirSync(app.get(ConfigService).storagePath, { recursive: true });
    await app.close().catch(() => {});
  }, 15000);
});
