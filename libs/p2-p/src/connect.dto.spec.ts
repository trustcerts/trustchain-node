import { Test, TestingModule } from '@nestjs/testing';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ConnectDto } from '@tc/p2-p/connect.dto';

describe('ConnectDto test', () => {
  let classObj: ConnectDto;
  let validConnection: ConnectDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectDto],
    }).compile();

    classObj = module.get<ConnectDto>(ConnectDto);
    validConnection = {
      identifier: 'TestIdentifier',
      peer: '127.0.0.1:3000',
    };
  });

  it('valid connection', () => {
    expect.assertions(1);
    return expect(
      validateOrReject(plainToClass(ConnectDto, validConnection)),
    ).resolves.toBeUndefined();
  });

  it('invalid connection: identifier is not a string.', () => {
    const invalidConnection = {
      identifier: 1234,
      peer: '123.456.789.000:0000',
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(ConnectDto, invalidConnection)),
    ).resolves.toBeDefined();
  });

  it('invalid connection: identifier is too short.', () => {
    const invalidConnection = validConnection;
    invalidConnection.identifier = 'A';
    expect.assertions(1);
    return expect(
      validate(plainToClass(ConnectDto, invalidConnection)),
    ).resolves.toBeDefined();
  });

  it('invalid connection: identifier is too long.', () => {
    const invalidConnection = validConnection;
    invalidConnection.identifier =
      '012345678910111213141516171819202122232425262728293031323333435363738394041424344454647484950';
    expect.assertions(1);
    return expect(
      validate(plainToClass(ConnectDto, invalidConnection)),
    ).resolves.toBeDefined();
  });

  it('invalid connection: peer is not a string.', () => {
    const invalidConnection = {
      identifier: 'TestIdentifier',
      peer: 123.456,
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(ConnectDto, invalidConnection)),
    ).resolves.toBeDefined();
  });

  it('invalid connection: peer is not an IP address.', () => {
    const invalidConnection = validConnection;
    invalidConnection.peer = '123456789000:0000';
    expect.assertions(1);
    return expect(
      validate(plainToClass(ConnectDto, invalidConnection)),
    ).resolves.toBeDefined();
  });
});
