import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NetworkGatewayModule } from '../src/network-gateway.module';
import * as request from 'supertest';
import { ClientRedis } from '@nestjs/microservices';
import {
  REDIS_INJECTION,
  SYSTEM_RESET,
  TRANSACTION_CREATED,
} from '@tc/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { DidId } from '@trustcerts/core';
import { WalletClientService } from '@tc/wallet-client';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { wait } from '@shared/helpers';
import { addRedisEndpoint } from '@shared/main-functions';
import { P2PService } from '@tc/p2-p';
import * as fs from 'fs';
import { Logger } from 'winston';
import { Connection } from '@shared/connection';
import { ConfigService } from '@tc/config/config.service';
import {
  closeServer,
  createDidForTesting,
  createWSServer,
  printDepsLogs,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import {
  WS_TRANSACTION,
  WS_TRANSACTION_REJECTED,
} from '@tc/blockchain/blockchain.events';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';
import { RoleManageType } from '@tc/did-id/constants';

describe('Network Gateway (e2e)', () => {
  let app: INestApplication;
  let walletService: WalletClientService;
  let didCachedService: DidIdCachedService;
  let clientRedis: ClientRedis;
  let p2PService: P2PService;
  let httpService: HttpService;
  let logger: Logger;
  let didTransaction: { did: DidId; transaction: TransactionDto };
  let dockerDeps: string[] = ['db', 'wallet', 'persist', 'redis'];

  beforeAll(async () => {
    console.time('before');
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NetworkGatewayModule],
    }).compile();
    console.timeLog('before', 'compiled');
    app = moduleFixture.createNestApplication();
    await app.init();
    console.timeLog('before', 'inited');
    await addRedisEndpoint(app);
    await app.startAllMicroservices();

    httpService = app.get(HttpService);
    clientRedis = app.get<ClientRedis>(REDIS_INJECTION);
    walletService = app.get(WalletClientService);
    didCachedService = app.get(DidIdCachedService);
    p2PService = app.get(P2PService);
    console.timeEnd('before');
  }, 60000);

  it('should return the type of the node and the service that was exposed', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      serviceType: 'network',
      nodeType: RoleManageType.Gateway,
    });
  });

  it('should check health', async () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('should send a new Transaction', async () => {
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
          closeServer(server);
          resolve(true);
        });
      });
      connection.socket.on('connect', async () => {
        p2PService.addConnection(connection);
        didTransaction = await createDidForTesting(
          walletService,
          didCachedService,
        );
        clientRedis.emit(TRANSACTION_CREATED, didTransaction.transaction);
      });
    });
  }, 10000);

  it('should reject a new Transaction', async () => {
    return new Promise(async (resolve) => {
      // Create a connection
      const connection = new Connection(logger, httpService);
      // Create a server
      const server: Server = await createWSServer(4001);
      //add a web socket to the server
      connection.socket = io('ws://localhost:4001');
      // listen for connection
      server.on('connection', (clientConnection) => {
        clientConnection.on(WS_TRANSACTION, (val: any) => {
          clientConnection.emit(WS_TRANSACTION_REJECTED, val);
        });
      });
      connection.socket.on(WS_TRANSACTION_REJECTED, (val: any) => {
        expect(val).toBeFalsy();
        // terminate connection
        connection.disconnect();
        // remove the identifier from P2P service
        p2PService.removeConnection(connection.identifier);
        // close the websocket server
        closeServer(server);
        resolve(true);
      });
      connection.socket.on('connect', async () => {
        p2PService.addConnection(connection);
        didTransaction = await createDidForTesting(
          walletService,
          didCachedService,
        );
        clientRedis.emit(TRANSACTION_CREATED, false);
      });
    });
  });

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
  });

  afterAll(async () => {
    try {
      fs.rmSync(app.get(ConfigService).storagePath, { recursive: true });
      clientRedis.close();
      await app.close();
    } catch (e) {
      console.error(e);
    } finally {
      await printDepsLogs(dockerDeps);
      await stopAndRemoveAllDeps();
    }
  }, 25000);
});
