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
import { DidHash } from '@tc/hash/schemas/did-hash.schema';
import { DidId } from '@tc/did-id/schemas/did-id.schema';
import { addRedisEndpoint, addTCPEndpoint } from '@shared/main-functions';
import { PersistClientService } from '@tc/persist-client';
import {
  generateTestDidIdTransaction,
  generateTestHashTransaction,
  sendBlock,
  setBlock,
  startDependencies,
  stopAndRemoveAllDeps,
} from '@test/helpers';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { wait } from '@shared/helpers';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { HashTransactionDto } from '@tc/hash/dto/hash-transaction.dto';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id-transaction.dto';
import { config } from 'dotenv';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let clientRedis: ClientRedis;
  let clientTCP: ClientTCP;
  let persistClientService: PersistClientService;
  let hashRepository: Model<DidHash>;
  let didRepository: Model<DidId>;
  let dockerDeps: string[] = ['persist', 'db', 'redis'];

  beforeAll(async () => {
    config({ path: 'test/.env' });
    config({ path: 'test/test.env', override: true });
    await startDependencies(dockerDeps);
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
    hashRepository = app.get<Model<DidHash>>(getModelToken(DidHash.name));
    didRepository = app.get<Model<DidId>>(getModelToken(DidId.name));
    persistClientService = app.get(PersistClientService);
    clientRedis = app.get(REDIS_INJECTION);
    clientTCP = app.get('ParseClient');
    await clientTCP.connect();
  }, 35000);

  beforeEach(async () => {
    clientRedis.emit(SYSTEM_RESET, {});
    await wait(2000);
  });

  it('Should parse and persist a block', async () => {
    const hashTransaction: HashTransactionDto = generateTestHashTransaction();
    const didTransaction: TransactionDto = generateTestDidIdTransaction();
    const block: Block = setBlock([hashTransaction, didTransaction], 1);
    if (await sendBlock(block, clientRedis)) {
      const hashes = await hashRepository.find();
      const did = await didRepository.find();
      expect(hashes.length).toEqual(1);
      expect(hashes[0].id).toBe(hashTransaction.body.value.id);
      expect(hashes[0].block.id).toBe(block.index);
      expect(did.length).toEqual(1);
      expect(did[0].id).toBe(didTransaction.body.value.id);
    } else {
      fail("it didn't parsed the block successfully");
    }
  }, 15000);

  it('Should remove from database and rebuild from persist', async () => {
    const hashTransaction: HashTransactionDto = generateTestHashTransaction();
    const didTransaction: DidIdTransactionDto = generateTestDidIdTransaction();
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
      hashes[0].block;
      const dids = await didRepository.find();
      const blocks = await persistClientService.getBlocks(1, 10);
      expect(blocks.length).toEqual(1);
      expect(hashes.length).toEqual(1);
      expect(dids.length).toEqual(1);
      expect(hashes[0].block.id).toEqual(blocks[0].index);
      expect(hashes[0].id).toEqual(hashTransaction.body.value.id);
      expect(dids[0].id).toEqual(didTransaction.body.value.id);
    } else {
      fail("it didn't parsed the block successfully");
    }
  }, 15000);

  it('Should reset the system and clean the database', async () => {
    const hashTransaction: TransactionDto = generateTestHashTransaction();
    const didTransaction: TransactionDto = generateTestDidIdTransaction();
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
  }, 15000);

  afterAll(async () => {
    clientRedis.close();
    clientTCP.close();
    await app.close();
    await stopAndRemoveAllDeps();
  }, 15000);
});
