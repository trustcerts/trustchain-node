import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PersistModule } from '../src/persist.module';
import { ClientRedis, ClientsModule, Transport } from '@nestjs/microservices';
import { REDIS_INJECTION, SYSTEM_RESET } from '@tc/event-client/constants';
import * as fs from 'fs';
import { addRedisEndpoint, addTCPEndpoint } from '@shared/main-functions';
import { join } from 'path';
import { Block } from '@tc/blockchain/block/block.interface';
import { wait } from '@shared/helpers';
import {
  generateTestHashTransaction,
  printDepsLogs,
  setBlock,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { ConfigService } from '@tc/config/config.service';
import { config } from 'dotenv';
import { PersistClientModule, PersistClientService } from '@tc/persist-client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let persistClientService: PersistClientService;
  let path: string;
  let dockerDeps: string[] = ['redis'];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PersistModule,
        ClientsModule.register([
          {
            name: 'PersistClient',
            transport: Transport.TCP,
            options: { port: 3001, host: '127.0.0.1' },
          },
        ]),
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await addRedisEndpoint(app);
    await addTCPEndpoint(app);
    await app.startAllMicroservices();
    await app.init();

    clientRedis = app.get(REDIS_INJECTION);
    persistClientService = new PersistClientService(app.get('PersistClient'));
    path = join(`${app.get(ConfigService).storagePath}`, 'bc');
  }, 25000);

  beforeEach(async () => {
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
  });

  it('should create a block', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const block: Block = setBlock([hashTransaction], 1);
    await persistClientService.setBlock(block);
    expect(fs.existsSync(path)).toBeTruthy();
    expect(fs.existsSync(`${path}/${block.index}.json`)).toBeTruthy();
    const savedBlock = JSON.parse(
      fs.readFileSync(`${path}/${block.index}.json`, 'utf8'),
    );
    expect(savedBlock).toEqual(block);
  }, 10000);

  it('should request a block', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const block: Block = setBlock([hashTransaction], 1);
    await persistClientService.setBlock(block);
    const savedBlock: Block = await persistClientService.getBlock(1);
    expect(savedBlock).toEqual(block);
  });

  it('should request many blocks', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const blocks: Block[] = [
      setBlock([hashTransaction], 1),
      setBlock([hashTransaction], 2),
      setBlock([hashTransaction], 3),
      setBlock([hashTransaction], 4),
      setBlock([hashTransaction], 5),
    ];
    for (let block of blocks) {
      await persistClientService.setBlock(block);
    }
    let requestData: { start: number; size: number } = { start: 2, size: 2 };
    const response: Block[] = await persistClientService.getBlocks(
      requestData.start,
      requestData.size,
    );
    expect(response.length).toBe(requestData.size);
    let ind: number = requestData.start;
    let i: number = 0;
    while (requestData.size > ind) {
      expect(response[i].index).toBe(ind);
      i++;
      ind++;
    }
  }, 60000);

  it('should count the blocks', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const blocks: Block[] = [
      setBlock([hashTransaction], 1),
      setBlock([hashTransaction], 2),
      setBlock([hashTransaction], 3),
    ];
    for (let block of blocks) {
      await persistClientService.setBlock(block);
    }
    const response = await persistClientService.getBlockCounter();
    expect(response).toEqual(blocks.length);
  });

  it('should reset the system', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const blocks: Block[] = [
      setBlock([hashTransaction], 1),
      setBlock([hashTransaction], 2),
    ];
    for (let block of blocks) {
      await persistClientService.setBlock(block);
    }
    expect(fs.readdirSync(path).length).toBe(2);
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
    expect(fs.readdirSync(path).length).toBe(0);
  }, 10000);

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
