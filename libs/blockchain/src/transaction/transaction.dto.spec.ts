import { Test, TestingModule } from '@nestjs/testing';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

describe('TransactionDto test', () => {
  let classObj: TransactionDto;
  let validTransaction: TransactionDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionDto],
    }).compile();

    classObj = module.get<TransactionDto>(TransactionDto);
    validTransaction = {
      type: TransactionType.HashCreation,
      date: Date.now(),
    };
  });

  it('valid transaction', () => {
    expect.assertions(1);
    return expect(
      validateOrReject(plainToClass(TransactionDto, validTransaction)),
    ).resolves.toBeUndefined();
  });

  // it('invalid transaction: type is empty', () => {
  //   const invalidTransaction = validTransaction;
  //   invalidTransaction.type = undefined;
  //   expect.assertions(1);
  //   return expect(
  //     validate(plainToClass(TransactionDto, invalidTransaction)),
  //   ).resolves.toBeDefined();
  // });

  it('invalid transaction: illegal date', () => {
    const invalidTransaction = validTransaction;
    invalidTransaction.date = -1;
    expect.assertions(1);
    return expect(
      validate(plainToClass(TransactionDto, invalidTransaction)),
    ).resolves.toBeDefined();
  });

  it('invalid transaction: signature is not a string.', () => {
    const invalidTransaction = {
      type: TransactionType.HashCreation,
      date: Date.now(),
      hash: '2c2390e239f7e6ee275dece461fad7794714f36ef64c5e1de0306593548d4c48',
      hashAlgorithm: 'sha256',
      signature: {
        signature: 1234,
        identifier: 'TestIdentifier',
        certHash:
          'f258d4576a1834f7df54096f3e56ec0aa0d74e37dce2338fc71312334fff1b58',
      },
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(TransactionDto, invalidTransaction)),
    ).resolves.toBeDefined();
  });

  it('invalid transaction: identifier is not a string.', () => {
    const invalidTransaction = {
      type: TransactionType.HashCreation,
      date: Date.now(),
      hash: '2c2390e239f7e6ee275dece461fad7794714f36ef64c5e1de0306593548d4c48',
      hashAlgorithm: 'sha256',
      signature: {
        signature: '22a3268d36579e37a15763f33a9...',
        identifier: 1234,
        certHash:
          'f258d4576a1834f7df54096f3e56ec0aa0d74e37dce2338fc71312334fff1b58',
      },
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(TransactionDto, invalidTransaction)),
    ).resolves.toBeDefined();
  });
});
