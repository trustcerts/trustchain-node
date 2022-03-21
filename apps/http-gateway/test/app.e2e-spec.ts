import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpGatewayModule } from '../src/http-gateway.module';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import {
  Did,
  exportKey,
  generateCryptoKeyPair,
  Identifier,
} from '@trustcerts/core';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { WalletClientService } from '@tc/wallet-client';
import { ClientRedis } from '@nestjs/microservices';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { addRedisEndpoint } from '@shared/main-functions';
import { HashService } from '@tc/blockchain';
import { RoleManageType } from '@tc/transactions/did-id/constants';
import { TemplateTransactionDto } from '@tc/transactions/did-template/dto/template.transaction.dto';
import { CompressionType } from '@tc/transactions/did-template/dto/compressiontype.dto';
import { InviteRequest } from '@tc/invite/schemas/invite-request.schema';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import * as fs from 'fs';
import { ConfigService } from '@tc/config/config.service';
import {
  createDidForTesting,
  setBlock,
  signContent,
  addListenerToTransactionParsed,
  transactionProperties,
  startDependencies,
  printDepsLogs,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { HttpGatewayService } from '../src/http-gateway.service';
import { wait } from '@shared/helpers';
import { InviteService } from '@tc/invite';
import { TextEncoder } from 'util';
import { HashDidTransactionDto } from '@tc/transactions/did-hash/dto/hash-transaction.dto';
import { CreateDidIdDto } from '@tc/transactions/did-id/dto/create-did-id.dto';
import { config } from 'dotenv';
import { ParseClientService } from '@tc/parse-client/parse-client.service';

describe('Http Gateway (e2e)', () => {
  let app: INestApplication;
  let didCachedService: DidIdCachedService;
  let walletClientService: WalletClientService;
  let hashService: HashService;
  let clientRedis: ClientRedis;
  let parseClientService: ParseClientService;
  let httpGateWayService: HttpGatewayService;
  let didTransaction: { did: Did; transaction: TransactionDto };
  let inviteService: InviteService;
  let dockerDeps: string[] = [
    'db',
    'wallet',
    'parse',
    'persist',
    'redis',
    'network-gateway',
  ];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpGatewayModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();
    await app.init();

    clientRedis = app.get(REDIS_INJECTION);
    inviteService = app.get(InviteService);
    didCachedService = app.get(DidIdCachedService);
    walletClientService = app.get(WalletClientService);
    hashService = app.get(HashService);
    httpGateWayService = app.get(HttpGatewayService);
    parseClientService = app.get(ParseClientService);
  }, 60000);

  beforeEach(async () => {
    httpGateWayService.reset();
    await wait(2000);
    didTransaction = await createDidForTesting(
      walletClientService,
      didCachedService,
    );
    const block = setBlock([didTransaction.transaction], 1);
    await parseClientService.parseBlock(block);
  });
  // #Init_Section
  it('should give the information about the service', () => {
    return request(app.getHttpServer()).get('/').expect(200);
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
      id: 'faketestid',
      secret: 'test_secret',
      url: 'localhost:3050',
    };
    return request(app.getHttpServer())
      .post('/init')
      .send(values)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  });

  it('check metrics', () => {
    return request(app.getHttpServer()).get('/metrics').expect(200);
  });

  //#Hash_Section
  it('should create a hash', async () => {
    const hashCreation: HashDidTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Hash,
        value: {
          id: 'did:trust:tc:dev:hash:HPaE7KKZ3J9Dku44h15nzQjbjJ6QuVQmRTFLkaTFG3gR',
          algorithm: 'sha256',
        },
      },
    };
    await signContent(hashCreation, walletClientService),
      addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/hash')
      .send(hashCreation)
      .expect(201);
  }, 10000);

  it('should revoke a hash', async () => {
    const hashCreation: HashDidTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Hash,
        value: {
          controller: {
            add: [didTransaction.did.id],
          },
          id: 'did:trust:tc:dev:hash:HPaE7KKZ3J9Dku44h15nzQjbjJ6QuVQmRTFLkaTFG3gR',
          algorithm: 'sha256',
        },
      },
    };
    await signContent(hashCreation, walletClientService);
    await parseClientService.parseBlock(setBlock([hashCreation], 2));
    const hashRevocation: HashDidTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Hash,
        value: {
          id: 'did:trust:tc:dev:hash:HPaE7KKZ3J9Dku44h15nzQjbjJ6QuVQmRTFLkaTFG3gR',
          revoked: new Date().toString(),
        },
      },
    };
    await signContent(hashRevocation, walletClientService),
      addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/hash')
      .send(hashRevocation)
      .expect(201);
  }, 7000);

  // #Did_Section
  it('test documents bigger as 1mb', async () => {
    const didDocTransaction: DidIdTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Did,
        value: {
          id: Identifier.generate('id'),
          service: {
            add: [
              {
                endpoint: 'e',
                id: `${[...Array(1000000)]
                  .map((i) => (~~(Math.random() * 36)).toString(36))
                  .join('')}`,
                type: 'test',
              },
            ],
          },
        },
      },
    };
    await signContent(didDocTransaction, walletClientService);
    addListenerToTransactionParsed(clientRedis, hashService);
    const size = new TextEncoder().encode(
      JSON.stringify(didDocTransaction),
    ).length;
    expect(size).toBeGreaterThanOrEqual(1000000);
    return request(app.getHttpServer())
      .post('/did')
      .send(didDocTransaction)
      .expect(413);
  });

  it('should add a did document', async () => {
    const didDocTransaction: DidIdTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Did,
        value: {
          id: Identifier.generate('id'),
        },
      },
    };
    await signContent(didDocTransaction, walletClientService);
    addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/did')
      .send(didDocTransaction)
      .expect(201);
  });

  it('should generate an invite for a new node', () => {
    const invite: InviteRequest = {
      id: didTransaction.did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: RoleManageType.Validator,
    };
    return request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  });

  it('should sign a public key for the client', async () => {
    const did = DidIdRegister.create();
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: RoleManageType.Gateway,
    };
    await inviteService.createInvite(invite);
    const pair = await generateCryptoKeyPair();
    const testCerts: CreateDidIdDto = {
      identifier: did.id,
      secret: 'test_secret',
      publicKey: await exportKey(pair.publicKey!),
    };
    addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/did/create')
      .send(testCerts)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  }, 8000);

  //#Template_Section
  it('should add a template', async () => {
    const templateTransaction: TemplateTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.Template,
        value: {
          schemaId: 'test',
          id: Identifier.generate('tmp'),
          template: 'string',
          compression: {
            type: CompressionType.JSON,
            value: 'string',
          },
        },
      },
    };
    await signContent(templateTransaction, walletClientService);
    addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/template')
      .send(templateTransaction)
      .expect(201);
  });

  //#Rebuild&Reset_Section
  it('should rebuild the pki and hash database based on local blockchain', async () => {
    return request(app.getHttpServer())
      .post(`/rebuild`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  }, 8000);

  it('should clean and reset', async () => {
    // TODO implement besser case
  }, 60000);

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
  }, 60000);
});
