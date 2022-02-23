import { Test, TestingModule } from '@nestjs/testing';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';

describe('SignatureDto test', () => {
  let classObj: SignatureDto;
  let validSignature: SignatureDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SignatureDto],
    }).compile();

    classObj = module.get<SignatureDto>(SignatureDto);
    validSignature = {
      signature: '22a3268d36579e37a15763f33a9...',
      identifier: 'TestIdentifier',
    };
  });

  it('valid signature', () => {
    expect.assertions(1);
    return expect(
      validateOrReject(plainToClass(SignatureDto, validSignature)),
    ).resolves.toBeUndefined();
  });

  it('invalid signature: signature is not a string.', () => {
    const invalidSignature = {
      signature: 1234,
      identifier: 'TestIdentifier',
      certHash:
        'f258d4576a1834f7df54096f3e56ec0aa0d74e37dce2338fc71312334fff1b58',
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });

  it('invalid signature: identifier is not a string.', () => {
    const invalidSignature = {
      signature: '22a3268d36579e37a15763f33a9...',
      identifier: 1234,
      certHash:
        'f258d4576a1834f7df54096f3e56ec0aa0d74e37dce2338fc71312334fff1b58',
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });

  it('invalid signature: identifier is too long.', () => {
    const invalidSignature = validSignature;
    invalidSignature.identifier = 'A';
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });

  it('invalid signature: identifier is too long.', () => {
    const invalidSignature = validSignature;
    invalidSignature.identifier =
      '012345678910111213141516171819202122232425262728293031323333435363738394041424344454647484950';
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });

  it('invalid signature: certHash is not a hash.', () => {
    const invalidSignature = validSignature;
    invalidSignature.identifier = '1234';
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });

  it('invalid signature: hash was not hashed with the correct algorithm.', () => {
    const invalidSignature = validSignature;
    invalidSignature.identifier =
      '8e47f1185ffd014d238fabd02a1a32defe698cbf38c037a90e3c0a0a32370fb52cbd641250508502295fcabcbf676c09470b27443868c8e5f70e26dc337288af';
    expect.assertions(1);
    return expect(
      validate(plainToClass(SignatureDto, invalidSignature)),
    ).resolves.toBeDefined();
  });
});
