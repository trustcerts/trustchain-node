import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpGatewayModule } from '../src/http-gateway.module';
import {
  SignatureType,
  TransactionDto,
} from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import {
  Did,
  DidRegister,
  exportKey,
  generateCryptoKeyPair,
  Identifier,
} from '@trustcerts/sdk';
import { DidTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { WalletClientService } from '@tc/wallet-client';
import { ClientRedis } from '@nestjs/microservices';
import { REDIS_INJECTION } from '@tc/event-client/constants';
import { HashCreationTransactionDto } from '@tc/hash/schemas/hash-creation.transaction.dto';
import { addRedisEndpoint } from '@shared/main-functions';
import { HashService } from '@tc/blockchain';
import { RoleManageAddEnum } from '@tc/did/constants';
import {
  CompressionType,
  TemplateTransactionDto,
} from '@tc/template/dto/template.transaction.dto';
import { CreateDidDto } from '@shared/create-did.dto';
import { InviteRequest } from '@tc/invite/schemas/invite-request.schema';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import * as fs from 'fs';
import { ConfigService } from '@tc/config/config.service';
import {
  createDidForTesting,
  setBlock,
  sendBlock,
  transactionProperties,
  signContent,
  addListenerToTransactionParsed,
  createTemplate,
} from '@test/helpers';
import { HttpGatewayService } from '../src/http-gateway.service';
import { wait } from '@apps/shared/helpers';
import { InviteService } from '@tc/invite';

describe('Http Gateway (e2e)', () => {
  let app: INestApplication;
  let didCachedService: DidCachedService;
  let hashCachedService: HashCachedService;
  let walletClientService: WalletClientService;
  let hashService: HashService;
  let clientRedis: ClientRedis;
  let httpGateWayService: HttpGatewayService;
  let didTransaction: { did: Did; transaction: TransactionDto };
  let inviteService: InviteService;

  beforeAll(async () => {
    process.env.NODE_SECRET = 'iAmJustASecret';
    process.env.RESET = 'true';
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HttpGatewayModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await app.startAllMicroservices();
    await app.init();

    clientRedis = app.get(REDIS_INJECTION);
    inviteService = app.get(InviteService);
    didCachedService = app.get(DidCachedService);
    hashCachedService = app.get(HashCachedService);
    walletClientService = app.get(WalletClientService);
    hashService = app.get(HashService);
    httpGateWayService = app.get(HttpGatewayService);
  }, 15000);

  beforeEach(async () => {
    httpGateWayService.reset();
    await wait(2000);
    didTransaction = await createDidForTesting(
      walletClientService,
      didCachedService,
    );
    await sendBlock(
      setBlock([didTransaction.transaction], 1),
      clientRedis,
      true,
    );
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
    const hashCreation: HashCreationTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.HashCreation,
        value: {
          hash: '9991d650bd700b85f15ec25e0d0275cfa988a4401378b9e3b95c8fe8d1a5b61e',
          algorithm: 'sha256',
        },
      },
    };
    await signContent(hashCreation, walletClientService),
      addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/hash/create')
      .send(hashCreation)
      .expect(201);
  }, 10000);

  it('should revoke a hash', async () => {
    const hashCreation: HashCreationTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.HashCreation,
        value: {
          hash: '9991df50bd701b85f15ec25e0d0275cfas88a4401378b9e3b95c8fe9d1a5b61e',
          algorithm: 'sha256',
        },
      },
    };
    await signContent(hashCreation, walletClientService);
    await sendBlock(setBlock([hashCreation], 2), clientRedis, true);
    const hashRevocation: HashCreationTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        type: TransactionType.HashRevocation,
        value: {
          hash: '9991df50bd701b85f15ec25e0d0275cfas88a4401378b9e3b95c8fe9d1a5b61e',
          algorithm: 'sha256',
        },
      },
    };
    await signContent(hashRevocation, walletClientService),
      addListenerToTransactionParsed(clientRedis, hashService);
    return request(app.getHttpServer())
      .post('/hash/revoke')
      .send(hashRevocation)
      .expect(201);
  }, 7000);

  // #Did_Section
  it('test documents bigger as 1mb', async () => {
    const didDocTransaction: DidTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        didDocSignature: {
          type: SignatureType.single,
          values: [],
        },
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
    const didDocTransaction: DidTransactionDto = {
      ...transactionProperties,
      body: {
        version: 1,
        date: new Date().toISOString(),
        didDocSignature: {
          type: SignatureType.single,
          values: [],
        },
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
      role: RoleManageAddEnum.Validator,
    };
    return request(app.getHttpServer())
      .post('/did/invite')
      .send(invite)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
  });

  it('should sign a public key for the client', async () => {
    const did = DidRegister.create();
    const invite: InviteRequest = {
      id: did.id,
      secret: 'test_secret',
      name: 'test_name',
      role: RoleManageAddEnum.Gateway,
    };
    await inviteService.createInvite(invite);
    const pair = await generateCryptoKeyPair();
    const testCerts: CreateDidDto = {
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
          schema: 'test',
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
    const hash =
      '9991d650bd700b85f15ec25e1d0275cfa988a4401378b9e3b95c8fe8d1a5b61e';
    await createTemplate(
      hash,
      walletClientService,
      didCachedService,
      clientRedis,
    );
    expect(await hashCachedService.getHash(hash)).toHaveProperty(`block`);
    await request(app.getHttpServer())
      .post(`/reset`)
      .set('authorization', 'Bearer ' + process.env.NODE_SECRET)
      .expect(201);
    await wait(2000);
    expect(await hashCachedService.getHash(hash)).toBeNull();
  });

  afterAll(async () => {
    fs.rmdirSync(app.get(ConfigService).storagePath, { recursive: true });
    clientRedis.close();
    await app.close().catch(() => {});
  }),
    15000;
});
