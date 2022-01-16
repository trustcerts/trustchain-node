import { Test, TestingModule } from '@nestjs/testing';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HashFilterDto } from './hash-filter.dto';

describe('HashFilterDto test', () => {
  let classObj: HashFilterDto;
  let validHashFilter: HashFilterDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashFilterDto],
    }).compile();

    classObj = module.get<HashFilterDto>(HashFilterDto);
    validHashFilter = {
      client: 'TestIdentifier',
      from: Date.now(),
      to: Date.now(),
      skip: 1,
      take: 1,
    };
  });

  it('valid hash filter', () => {
    expect.assertions(1);
    // return expect(
    //   validateOrReject(plainToClass(HashFilterDto, validHashFilter)),
    // ).resolves.toBeUndefined();
  });

  it('invalid hash filter: Client is not a string.', () => {
    const invalidHashFilter = {
      client: 1234,
      from: Date.now(),
      to: Date.now(),
      skip: 1,
      take: 1,
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: Client is too short.', () => {
    const invalidHashFilter = validHashFilter;
    invalidHashFilter.client = 'A';
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: Client is too long.', () => {
    const invalidHashFilter = validHashFilter;
    invalidHashFilter.client =
      '012345678910111213141516171819202122232425262728293031323333435363738394041424344454647484950';
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: from is not a number.', () => {
    const invalidHashFilter = {
      client: 'TestIdentifier',
      from: '01.01.2001',
      to: Date.now(),
      skip: 1,
      take: 1,
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: from is not positive.', () => {
    const invalidHashFilter = validHashFilter;
    invalidHashFilter.from = -1;
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: skip is not a number.', () => {
    const invalidHashFilter = {
      client: 'TestIdentifier',
      from: Date.now(),
      to: Date.now(),
      skip: '1',
      take: 1,
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });

  it('invalid hash filter: skip is not positive.', () => {
    const invalidHashFilter = validHashFilter;
    invalidHashFilter.skip = -1;
    expect.assertions(1);
    return expect(
      validate(plainToClass(HashFilterDto, invalidHashFilter)),
    ).resolves.toBeDefined();
  });
});
