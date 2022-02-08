import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { NetworkObserverModule } from '../src/network-observer.module';
import * as request from 'supertest';
import { addRedisEndpoint } from '@shared/main-functions';
import { ClientRedis } from '@nestjs/microservices';
import { wait } from '@shared/helpers';
import { REDIS_INJECTION, SYSTEM_RESET } from '@tc/event-client/constants';
import { P2PService } from '@tc/p2-p';
import * as fs from 'fs';
import { Logger } from 'winston';
import { ConfigService } from '@tc/config/config.service';
import { Connection } from '@shared/connection';
import { closeServer, createWSServer, startDependencies, stopAndRemoveAllDeps } from '@test/helpers';
import { Server } from 'socket.io';
import { io } from 'socket.io-client';
import { HttpService } from '@nestjs/axios';
import { config } from 'dotenv';

describe('Network Observer (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let p2PService: P2PService;
  let httpService: HttpService;
  let logger: Logger;
  let dockerDeps: string[] = ['db' , 'wallet' , 'persist' , 'redis'];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NetworkObserverModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();
    await app.init();

    clientRedis = app.get<ClientRedis>(REDIS_INJECTION);
    p2PService = app.get(P2PService);
  }, 15000);

  it('should return the type of the node and the service that was exposed', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      serviceType: 'network',
      nodeType: 'observer',
    });
  });

  it('should check health', async () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('should reset the service', async () => {
    return new Promise(async (resolve) => {
      const connection = new Connection(logger, httpService);
      const server: Server = await createWSServer(4000);
      connection.socket = io('ws://localhost:4000');
      p2PService.connections.push(connection);
      expect(p2PService.connections.length).toBe(1);
      clientRedis.emit(SYSTEM_RESET, {});
      await wait(1500);
      expect(p2PService.connections.length).toBe(0);
      closeServer(server);
      resolve(true);
    });
  });

  afterAll(async () => {
    fs.rmSync(app.get(ConfigService).storagePath, { recursive: true });
    clientRedis.close();
    await app.close();
    await stopAndRemoveAllDeps()
  }, 15000);
});
