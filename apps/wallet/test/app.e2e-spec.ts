import { INestApplication } from '@nestjs/common';
import {
  ClientRedis,
  ClientsModule,
  ClientTCP,
  Transport,
} from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS_INJECTION, SYSTEM_RESET } from '@tc/event-client/constants';
import { WalletModule } from '../src/wallet.module';
import {
  WALLET_GET_ID,
  WALLET_PUB_KEY,
  WALLET_SET_ID,
  WALLET_SIGN,
} from '@tc/wallet-client/endpoints';
import { addRedisEndpoint, addTCPEndpoint } from '@shared/main-functions';
import * as fs from 'fs';
import { join } from 'path';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { wait } from '@shared/helpers';
import { startDependencies, stopDependencies } from '@test/helpers';
import { ConfigService } from '@tc/config/config.service';
import { Did, DidRegister } from '@trustcerts/sdk';
import { lastValueFrom } from 'rxjs';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let clientTCP: ClientTCP;
  let path: string;

  beforeAll(async () => {
    if ((global as any).isE2E) {
      await stopDependencies(['parse', 'persist', 'wallet']);
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        WalletModule,
        ClientsModule.register([
          {
            name: 'WalletClient',
            transport: Transport.TCP,
            options: { port: 3001 },
          },
        ]),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await addTCPEndpoint(app);
    await app.startAllMicroservices();
    await app.init();
    path = join(`${app.get(ConfigService).storagePath}`, 'wallet.json');
    clientRedis = app.get(REDIS_INJECTION);
    clientTCP = app.get('WalletClient');
    await clientTCP.connect();
  }, 15000);

  beforeEach(async () => {
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
  })

  it('should set a wallet id and create a wallet.json file', async () => {
    const did: Did = DidRegister.create();
    await new Promise(resolve => {
      clientTCP.send(WALLET_SET_ID, did.id).subscribe({
        complete: () => {
          resolve(true);
        },
      });
    })
  const key = JSON.parse(fs.readFileSync(path, 'utf-8'));
  expect(fs.existsSync(path)).toBeTruthy();
  expect(key).toMatchObject({
    privateKey: { key_ops: ['sign'] },
    publicKey: { key_ops: ['verify'] },
  });
  expect(key.identifier).toContain(did.id);
});

it('should get the wallet id', async () => {
  const did: Did = DidRegister.create();
  await new Promise(resolve => {
    clientTCP.send(WALLET_SET_ID, did.id).subscribe({
      complete: () => {
        resolve(true);
      },
    });
  })
  const id = await lastValueFrom(clientTCP.send(WALLET_GET_ID, {}))
  expect(id).toEqual(did.id)
});

it('should get the wallet public key', async () => {
  const did: Did = DidRegister.create();
  await new Promise(resolve => {
    clientTCP.send(WALLET_SET_ID, did.id).subscribe({
      complete: () => {
        resolve(true);
      },
    });
  })
  const pubKey = await lastValueFrom(clientTCP.send(WALLET_PUB_KEY, {}));
  const { publicKey } = JSON.parse(fs.readFileSync(path, 'utf-8'));
  expect(pubKey.value).toMatchObject(publicKey);
  expect(pubKey.id).toContain(did.id);
});

it('should sign a value with the private key', async () => {
  // CryptoService muss neugestartet werden
  const did: Did = DidRegister.create();
    await new Promise(resolve => {
      clientTCP.send(WALLET_SET_ID, did.id).subscribe({
        complete: () => {
          resolve(true);
        },
      });
    })
  const data = await lastValueFrom(clientTCP
    .send<SignatureDto>(WALLET_SIGN, 'iamjustasignedstring'))
  expect(data).toHaveProperty('signature');
  expect(data.identifier).toContain(did.id);
});

it('should reset the service', async () => {
  const did: Did = DidRegister.create();
    await new Promise(resolve => {
      clientTCP.send(WALLET_SET_ID, did.id).subscribe({
        complete: () => {
          resolve(true);
        },
      });
    })
  expect(fs.existsSync(path)).toBeTruthy();
  expect(app.get(ConfigService).getConfig('IDENTIFIER')).toBe(did.id)
  clientRedis.emit(SYSTEM_RESET, {});
  await wait(2000);
  expect(fs.existsSync(path)).toBeFalsy();
  expect(app.get(ConfigService).getConfig('IDENTIFIER')).toBeUndefined()

});


afterAll(async () => {
  fs.rmdirSync(app.get(ConfigService).storagePath, { recursive: true });
  if ((global as any).isE2E) {
    await startDependencies(['parse', 'persist', 'wallet']);
  }
  clientRedis.close();
  clientTCP.close();
  await app.close();
}, 10000);
});