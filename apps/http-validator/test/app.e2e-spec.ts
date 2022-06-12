import { Test, TestingModule } from '@nestjs/testing';
import { HttpValidatorModule } from '../src/http-validator.module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import { InviteRequest } from '@tc/invite/schemas/invite-request.schema';
import { WalletClientService } from '@tc/clients/wallet-client';
import { DidIdRegister, Identifier } from '@trustcerts/did';
import { REDIS_INJECTION } from '@tc/clients/event-client/constants';
import { ClientRedis } from '@nestjs/microservices';
import { HashService } from '@tc/blockchain';
import { addRedisEndpoint } from '@shared/main-functions';
import { ConfigService } from '@tc/config/config.service';
import {
  addListenerToTransactionParsed,
  printDepsLogs,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { HttpValidatorService } from '../src/http-validator.service';
import { wait } from '@shared/helpers';
import { config } from 'dotenv';
import { CreateDidIdDto } from '@tc/transactions/did-id/dto/create-did-id.dto';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';

describe('ValidatorController (e2e)', () => {
  let app: INestApplication;
  let walletClientService: WalletClientService;
  let clientRedis: ClientRedis;
  let hashService: HashService;
  let httpValidatorService: HttpValidatorService;
  let dockerDeps: string[] = [
    'db',
    'wallet',
    'parse',
    'persist',
    'redis',
    'network-validator',
  ];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
    Identifier.setNetwork('tc:test');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpValidatorModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();
    await app.init();

    clientRedis = app.get(REDIS_INJECTION);
    walletClientService = app.get(WalletClientService);
    hashService = app.get(HashService);
    httpValidatorService = app.get(HttpValidatorService);
  }, 60000);

  beforeEach(async () => {
    httpValidatorService.reset();
    await wait(2000);
  });

  //#Init_Section
  it('should return the type of the node and the service that was exposed', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      serviceType: 'http',
      nodeType: DidRoles.Validator,
    });
  });

  //#Health_Section
  it('should check health', () => {
    return request(app.getHttpServer()).get('/health').expect(200);
  });

  it('should check health init', () => {
    return request(app.getHttpServer()).get('/health/init').expect(200);
  });

  it('check metrics', () => {
    return request(app.getHttpServer()).get('/metrics').expect(200);
  });

  // #Did_Section
  it('should generate an invite for a new node', () => {
    const did = DidIdRegister.create();
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: DidRoles.Validator,
    };
    return request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  });

  it('should sign a public key for the gateway', async () => {
    const did = DidIdRegister.create();
    await walletClientService.setOwnInformation(did.id);
    const pair = await walletClientService.getPublicKey();
    const testCert: CreateDidIdDto = {
      identifier: did.id,
      secret: 'test_secret',
      publicKey: pair.value,
    };
    addListenerToTransactionParsed(clientRedis, hashService);
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: DidRoles.Validator,
    };
    await request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);

    return request(app.getHttpServer())
      .post('/did/create')
      .send(testCert)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  }, 8000);

  it('should resolve the name to a given did that was created by this node', async () => {
    Identifier.setNetwork('tc:test');
    const did = DidIdRegister.create();
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: DidRoles.Validator,
    };
    await request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
    return request(app.getHttpServer())
      .get(`/did/resolve/${did.id}`)
      .expect(200)
      .expect({ name: 'test_name' });
  });

  //#Rebuild&Reset_Section
  it('should rebuild the pki and hash database based on local blockchain', async () => {
    const did = DidIdRegister.create();
    await walletClientService.setOwnInformation(did.id);
    const pair = await walletClientService.getPublicKey();
    const testCert: CreateDidIdDto = {
      identifier: did.id,
      secret: 'test_secret',
      publicKey: pair.value,
    };
    addListenerToTransactionParsed(clientRedis, hashService);
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: DidRoles.Validator,
    };
    await request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);

    await request(app.getHttpServer())
      .post('/did/create')
      .send(testCert)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);

    return request(app.getHttpServer())
      .post(`/rebuild`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  }, 10000);

  it('should clean and reset', () => {
    return request(app.getHttpServer())
      .post(`/reset`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
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
