import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PersistModule } from '../src/persist.module';
import {
  ClientRedis,
  ClientsModule,
  ClientTCP,
  Transport,
} from '@nestjs/microservices';
import {
  BLOCKS_REQUEST,
  BLOCK_COUNTER,
  BLOCK_REQUEST,
  REDIS_INJECTION,
  SYSTEM_RESET,
} from '@tc/event-client/constants';
import * as fs from 'fs';
import { addRedisEndpoint, addTCPEndpoint } from '@shared/main-functions';
import { join } from 'path';
import { Block } from '@tc/blockchain/block/block.interface';
import { wait } from '@shared/helpers';
import {
  generateTestHashTransaction,
  sendBlock,
  setBlock,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@tc/config/config.service';
import { config } from 'dotenv';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let clientTCP: ClientTCP;
  let path: string;
  let dockerDeps: string[] = ['redis'];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    await startDependencies(dockerDeps);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PersistModule,
        ClientsModule.register([
          {
            name: 'PersistClient',
            transport: Transport.TCP,
            options: { port: 3001, host: 'localhost' },
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
    clientTCP = app.get('PersistClient');
    path = join(`${app.get(ConfigService).storagePath}`, 'bc');
    await clientTCP.connect();
  }, 25000);

  beforeEach(async () => {
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
  });

  it('should create a block', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const block: Block = setBlock([hashTransaction], 1);
    await sendBlock(block, clientRedis, true);
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
    await sendBlock(block, clientRedis, true);
    const savedBlock: Block = await lastValueFrom(
      clientTCP.send(BLOCK_REQUEST, 1),
    );
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
      await sendBlock(block, clientRedis, true);
    }
    let requestData: { start: number; size: number } = { start: 2, size: 2 };
    const response: Block[] = await lastValueFrom(
      clientTCP.send(BLOCKS_REQUEST, requestData),
    );
    expect(response.length).toBe(requestData.size);
    let ind: number = requestData.start;
    let i: number = 0;
    while (requestData.size > ind) {
      expect(response[i].index).toBe(ind);
      i++;
      ind++;
    }
  }, 15000);

  it('should count the blocks', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const blocks: Block[] = [
      setBlock([hashTransaction], 1),
      setBlock([hashTransaction], 2),
      setBlock([hashTransaction], 3),
    ];
    for (let block of blocks) {
      await sendBlock(block, clientRedis, true);
    }
    const response = await lastValueFrom(
      clientTCP.send<Block>(BLOCK_COUNTER, {}),
    );
    expect(response).toEqual(3);
  });

  it('should reset the system', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const blocks: Block[] = [
      setBlock([hashTransaction], 1),
      setBlock([hashTransaction], 2),
    ];
    for (let block of blocks) {
      await sendBlock(block, clientRedis, true);
    }
    expect(fs.readdirSync(path).length).toBe(2);
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
    expect(fs.readdirSync(path).length).toBe(0);
  }, 10000);

    afterAll(async () => {
      fs.rmSync(app.get(ConfigService).storagePath, { recursive: true });
      await stopAndRemoveAllDeps();
      clientRedis.close();
      clientTCP.close();
      await app.close();
    }, 15000);
});
