import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { join } from 'path';
import * as fs from 'fs';
import { WalletModule } from './wallet.module';
import { INestApplication } from '@nestjs/common';
import { startDependencies, stopDependencies } from '../../../test/helpers';
import { wait } from '@shared/helpers';

describe('MyService', () => {
  let app: INestApplication;
  let service: WalletService;
  const _id = 'iamafakeidfromservice';
  let _path: string;

  beforeAll(async () => {
    await startDependencies(['redis']);
    await wait(3000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WalletModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    service = app.get<WalletService>(WalletService);
    _path = join(`${process.env.STORAGE!}`, 'wallet.json');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('setOwnInformation() should set a wallet and create a wallet.json file', async () => {
    await service.setOwnInformation(_id);
    const key = JSON.parse(fs.readFileSync(_path, 'utf-8'));
    expect(fs.existsSync(_path)).toBeTruthy();
    expect(key).toMatchObject({
      privateKey: { key_ops: ['sign'] },
      publicKey: { key_ops: ['verify'] },
    });
    expect(key.identifier).toContain(_id);
  });

  it('getOwnInformation() should get a wallet id', async () => {
    const id = service.getOwnInformation();
    expect(id).toEqual(_id);
  });

  it('getPublicKey() should get the public key', async () => {
    const pubKey = await service.getPublicKey();
    const { publicKey } = JSON.parse(fs.readFileSync(_path, 'utf-8'));
    expect(pubKey.value).toMatchObject(publicKey);
    expect(pubKey.id).toContain(_id);
  });

  it('sign() should sign a value with the private key', async () => {
    const data = await service.sign('sign_test');
    expect(data).toHaveProperty('signature');
    expect(data.identifier).toContain(_id);
  });

  it('reset() should reset the service and remove wallet.json', async () => {
    service.reset();
    expect(fs.existsSync(_path)).toBeFalsy();
    expect(service.getOwnInformation()).toBeUndefined();
  });

  afterEach(async () => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(true), 2000);
    });
  });
  afterAll(async () => {
    await app.close();
    await stopDependencies(['redis']);
  });
});
