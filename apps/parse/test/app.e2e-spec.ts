import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ParseModule } from '../src/parse.module';
import {
  CHAIN_REBUILD,
  REDIS_INJECTION,
  SYSTEM_RESET,
} from '@tc/event-client/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import {
  ClientRedis,
  ClientsModule,
  ClientTCP,
  Transport,
} from '@nestjs/microservices';
import { Hash } from '@tc/hash/schemas/hash.schema';
import { Did } from '@tc/did/schemas/did.schema';
import { addRedisEndpoint, addTCPEndpoint } from '../../shared/main-functions';
import { PersistClientService } from '@tc/persist-client';
import {
  generateTestTransaction,
  sendBlock,
  setBlock,
  startDependencies,
  stopDependencies,
} from '@test/helpers';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { wait } from '@shared/helpers';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let clientTCP: ClientTCP;
  let persistClientService: PersistClientService;
  let hashRepository: Model<Hash>;
  let didRepository: Model<Did>;

  beforeAll(async () => {
    if ((global as any).isE2E) {
      await stopDependencies(['parse']);
    }
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ParseModule,
        ClientsModule.register([
          {
            name: 'ParseClient',
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
    hashRepository = app.get<Model<Hash>>(getModelToken(Hash.name));
    didRepository = app.get<Model<Did>>(getModelToken(Did.name));
    persistClientService = app.get(PersistClientService);
    clientRedis = app.get(REDIS_INJECTION);
    clientTCP = app.get('ParseClient');
    await clientTCP.connect();
  }, 15000);

  beforeEach(async () => {
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
  });

  it('Should parse and persist a block', async () => {
    const hashTransaction: TransactionDto = generateTestTransaction('hash');
    const didTransaction: TransactionDto = generateTestTransaction('did');
    const block: Block = setBlock([hashTransaction, didTransaction], 1);
    if (await sendBlock(block, clientRedis)) {
      const hashes = await hashRepository.find();
      const did = await didRepository.find();
      expect(hashes.length).toEqual(1);
      expect(hashes[0].hash).toBe(hashTransaction.body.value.hash);
      expect(hashes[0].block.id).toBe(block.index);
      expect(did.length).toEqual(1);
      expect(did[0].id).toBe(didTransaction.body.value.id);
    } else {
      fail("it didn't parsed the block successfully");
    }
  });

  it('Should remove from database and rebuild from persist', async () => {
    const hashTransaction: TransactionDto = generateTestTransaction('hash');
    const didTransaction: TransactionDto = generateTestTransaction('did');
    const block: Block = setBlock([hashTransaction, didTransaction], 1);
    if (await sendBlock(block, clientRedis)) {
      await new Promise<void>((resolve) => {
        clientTCP.send(CHAIN_REBUILD, {}).subscribe({
          complete: () => {
            resolve();
          },
        });
      });
      const hashes = await hashRepository.find();
      const dids = await didRepository.find();
      const blocks = await persistClientService.getBlocks(1, 10);
      expect(blocks.length).toEqual(1);
      expect(hashes.length).toEqual(1);
      expect(dids.length).toEqual(1);
      expect(hashes[0].block.id).toEqual(blocks[0].index);
      expect(hashes[0].hash).toEqual(hashTransaction.body.value.hash);
      expect(dids[0].id).toEqual(didTransaction.body.value.id);
    } else {
      fail("it didn't parsed the block successfully");
    }
  });

  it('Should reset the system and clean the database', async () => {
    const hashTransaction: TransactionDto = generateTestTransaction('hash');
    const didTransaction: TransactionDto = generateTestTransaction('did');
    const block: Block = setBlock([hashTransaction, didTransaction], 1);
    if (await sendBlock(block, clientRedis)) {
      clientRedis.emit(SYSTEM_RESET, {});
      await wait(2000);
      const blocks = await persistClientService.getBlocks(1, 10);
      const hashes = await hashRepository.find();
      const did = await didRepository.find();
      expect(blocks.length).toEqual(0);
      expect(hashes.length).toEqual(0);
      expect(did.length).toEqual(0);
    } else {
      fail("it didn't parsed the block successfully");
    }
  });

  afterAll(async () => {
    await wait(3000);
    if ((global as any).isE2E) {
      await startDependencies(['parse']);
    }
    clientRedis.close();
    clientTCP.close();
    await app.close().catch(() => {});
  }, 15000);
});
