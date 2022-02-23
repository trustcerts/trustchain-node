import { Test, TestingModule } from '@nestjs/testing';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HashRevocationTransactionDto } from '@tc/hash/dto/hash-revocation.transaction.dto';

describe('TransactionHashRevocationDto test', () => {
  let classObj: HashRevocationTransactionDto;
  let validTransaction: HashRevocationTransactionDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashRevocationTransactionDto],
    }).compile();

    classObj = module.get<HashRevocationTransactionDto>(
      HashRevocationTransactionDto,
    );
    // validTransaction = {
    //   type: TransactionType.HashRevocation,
    //   date: Date.now(),
    //   hash: '2c2390e239f7e6ee275dece461fad7794714f36ef64c5e1de0306593548d4c48',
    //   hashAlgorithm: 'sha256',
    //   signature: {
    //     signature: '22a3268d36579e37a15763f33a9...',
    //     identifier: 'TestIdentifier',
    //     certHash:
    //       'f258d4576a1834f7df54096f3e56ec0aa0d74e37dce2338fc71312334fff1b58',
    //   },
    // };
  });

  it('valid transaction', () => {
    expect.assertions(1);
    return expect(
      validateOrReject(
        plainToClass(HashRevocationTransactionDto, validTransaction),
      ),
    ).resolves.toBeUndefined();
  });

  it('invalid transaction: wrong type', () => {
    const invalidTransaction = validTransaction;
    invalidTransaction.type = TransactionType.HashRevocation;
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashRevocationTransactionDto, invalidTransaction)),
    ).resolves.toBeDefined();
  });

  // it('invalid transaction: type is empty', () => {
  //   const invalidTransaction = validTransaction;
  //   invalidTransaction.type = null;
  //   expect.assertions(1);
  //   return expect(
  //     validate(plainToClass(TransactionHashRevocationDto, invalidTransaction)),
  //   ).resolves.toBeDefined();
  // });
});
