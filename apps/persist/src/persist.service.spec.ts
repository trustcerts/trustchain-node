import { Test, TestingModule } from '@nestjs/testing';
import { PersistService } from './persist.service';
import { ConfigService } from '@tc/config';
import { Block } from '@tc/blockchain/block/block.interface';
import * as fs from 'fs';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { generateTestTransaction, setBlock } from '@test/helpers';
import { getSupportInfo } from 'prettier';
import { getToken } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import jestSharedConfig from 'jest.sharedConfig';

describe('PersistService', () => {
  let service: PersistService;
  let configServiceMock: ConfigService = new ConfigService({}, {}, {});
  let _path: string;
  let promBlockCounter: Counter<string>;
  const hashTransaction: TransactionDto = generateTestTransaction('hash');

  beforeAll(async () => {
    if (!fs.existsSync(process.env.STORAGE!)) {
      fs.mkdirSync(`${process.env.STORAGE!}/bc`, { recursive: true });
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersistService,
        { provide: ConfigService, useValue: configServiceMock },
        {
          provide: getToken('blockchainLength'),
          useValue: {
            inc: jest.fn(() => ''),
            reset: jest.fn(() => ''),
          },
        },
      ],
    }).compile();
    _path = `${configServiceMock.storagePath}/bc`;
    service = module.get<PersistService>(PersistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('setBlock() should set a block by creating a json block', async () => {
    const index = 1;
    const block: Block = setBlock([hashTransaction], index);
    service.setBlock(block);
    expect(
      fs.existsSync(_path) && fs.existsSync(`${_path}/${index}.json`),
    ).toBeTruthy();
    const file = fs.readFileSync(`${_path}/${index}.json`, 'utf8');
    expect(JSON.parse(file)).toStrictEqual(block);
  });

  it('blockCounter should count all blocks', async () => {
    service.setBlock(setBlock([hashTransaction], 2));
    service.setBlock(setBlock([hashTransaction], 3));
    service.setBlock(setBlock([hashTransaction], 4));
    const files = fs.readdirSync(_path);
    expect(service.blockCounter).toBe(files.length);
  });

  it('latestBlock() should return the latest block', () => {
    const file = fs.readFileSync(
      `${_path}/${fs.readdirSync(_path).length}.json`,
      'utf8',
    );
    expect(service.latestBlock()).toStrictEqual(JSON.parse(file));
  });

  it('getBlock() should return block at a given index number', () => {
    const index: number = 2;
    const file = fs.readFileSync(`${_path}/${index}.json`, 'utf8');
    expect(service.getBlock(index)).toStrictEqual(JSON.parse(file));
  });

  it('getBlocks() should return [] of blocks at a given object', () => {
    const obj: { start: number; size: number } = { start: 2, size: 2 };
    const obj2: { start: number; size: number } = { start: 10, size: 2 };

    const wantedFiles = fs
      .readdirSync(_path)
      .sort((a, b) => Number(a.split('.')[0]) - Number(b.split('.')[0]))
      .slice(obj.start - 1, obj.size + obj.start - 1);
    const blocks: Block[] = wantedFiles.map((file) => {
      return JSON.parse(fs.readFileSync(_path.concat('/', file), 'utf8'));
    });
    expect(service.getBlocks(obj.start, obj.size)).toEqual(blocks);
    expect(service.getBlocks(obj2.start, obj2.size)).toEqual([]);
  });

  it('clearBlockchain() should delete the blockchain of the node', () => {
    service.clearBlockchain();
    expect(fs.readdirSync(_path).length).toBe(0);
  });
});
