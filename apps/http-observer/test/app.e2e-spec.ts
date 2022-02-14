import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpObserverModule } from '../src/http-observer.module';
import { ClientRedis } from '@nestjs/microservices';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { WalletClientService } from '@tc/wallet-client';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { addRedisEndpoint } from '@shared/main-functions';
import * as fs from 'fs';
import { ConfigService } from '@tc/config/config.service';
import {
  createHash,
  createSchema,
  createTemplate,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { HttpObserverService } from '../src/http-observer.service';
import { wait } from '@shared/helpers';
import { config } from 'dotenv';

describe('ObserverController (e2e)', () => {
  let app: INestApplication;
  let didCachedService: DidIdCachedService;
  let walletClientService: WalletClientService;
  let clientRedis: ClientRedis;
  let httpObserverService: HttpObserverService;
  let dockerDeps: string[] = [
    'db',
    'wallet',
    'parse',
    'persist',
    'redis',
    'network-observer',
  ];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpObserverModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();
    await app.init();
    clientRedis = app.get(REDIS_INJECTION);
    didCachedService = app.get(DidIdCachedService);
    walletClientService = app.get(WalletClientService);
    httpObserverService = app.get(HttpObserverService);
  }, 60000);

  beforeEach(async () => {
    httpObserverService.reset();
    await wait(2000);
  });

  //#Init_Section
  it('should give the information about the service', async () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      serviceType: 'http',
      nodeType: 'observer',
    });
  });

  it('should init the service', async () => {
    // Spy on init
    // #TODO implement in a external server
    jest
      .spyOn(walletClientService, 'requestSignedDid')
      .mockImplementationOnce(() => {
        return new Promise((resolve) => resolve(['Client']));
      });
    const values: InviteNode = {
      id: 'irgendeineId',
      secret: 'testSecret',
      url: 'localhost:3050',
    };
    return request(app.getHttpServer())
      .post('/init')
      .send(values)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  });

  it('should look for an entry to the hash', async () => {
    // TODO use Identifier.generate('hash', 'foobar')
    const hash =
      'did:trust:tc:dev:hash:9991d650bd700b85f15ec25e0df27gcfa988a4401378b9e3b95c8fe8d1a5b61e';
    await createHash(hash, walletClientService, didCachedService, clientRedis);
    return request(app.getHttpServer()).get(`/hash/${hash}`).expect(200);
  });

  //#Schema_Section
  it('should look for an entry to the schema', async () => {
    let { schemaTransaction } = await createSchema(
      '<h1>Hello there</h1>',
      walletClientService,
      didCachedService,
      clientRedis,
    );
    request(app.getHttpServer())
      .get(`/schema/${schemaTransaction.body.value.id}`)
      .expect(200);

    request(app.getHttpServer())
      .get(`/schema/${schemaTransaction.body.value.id}12322`)
      .expect(404);
  });

  //#Did_Section
  it('should return transaction to assemble a did document', async () => {
    let { didTransaction } = await createTemplate(
      '<h1>Hello there</h1>',
      '',
      '',
      walletClientService,
      didCachedService,
      clientRedis,
    );
    return request(app.getHttpServer())
      .get(`/did/${didTransaction.did.id}`)
      .expect(200);
  });

  it('should return the did document to a did', async () => {
    let { didTransaction } = await createTemplate(
      '<h1>Hello there</h1>',
      '',
      '',
      walletClientService,
      didCachedService,
      clientRedis,
    );
    return request(app.getHttpServer())
      .get(`/did/${didTransaction.did.id}/doc`)
      .expect(200);
  });

  it('should return the diddocument-metadata to a did', async () => {
    let { didTransaction } = await createTemplate(
      '<h1>Hello there</h1>',
      '',
      '',
      walletClientService,
      didCachedService,
      clientRedis,
    );
    return request(app.getHttpServer())
      .get(`/did/${didTransaction.did.id}/metadata`)
      .expect(200);
  });

  //#Rebuild&Reset_Section
  it('should rebuild the pki and hash database based on local blockchain', async () => {
    await createTemplate(
      '<h1>Hello there</h1>',
      '',
      '',
      walletClientService,
      didCachedService,
      clientRedis,
    );
    return request(app.getHttpServer())
      .post(`/rebuild`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  }, 60000);

  it('should clean and reset', async () => {
    // TODO use Identifier.generate('hash', 'foobar')
    const hash =
      'did:trust:tc:dev:hash:9991d650bd700b85f15ec25e0df27gcfa988a4401378b9e3b95c8fe8d1a5b61e';
    let { didTransaction } = await createHash(
      hash,
      walletClientService,
      didCachedService,
      clientRedis,
    );
    const res = await request(app.getHttpServer())
      .get(`/did/${didTransaction.did.id}`)
      .expect(200);
    expect(res.text).toContain(didTransaction.did.id);
    await request(app.getHttpServer())
      .post(`/reset`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
    await wait(2000);
    return request(app.getHttpServer())
      .get(`/did/${didTransaction.did.id}`)
      .expect(404);
  }, 60000);

  afterAll(async () => {
    fs.rmSync(app.get(ConfigService).storagePath, { recursive: true });
    clientRedis.close();
    await app.close().catch(() => {});
    await stopAndRemoveAllDeps();
  }, 60000);
});
