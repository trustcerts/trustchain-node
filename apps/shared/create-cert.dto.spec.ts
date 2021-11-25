import { Test, TestingModule } from '@nestjs/testing';
import { validate, validateOrReject } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDidDto } from './create-did.dto';

describe('CreateCertDto test', () => {
  let classObj: CreateDidDto;
  let validCreateCert: CreateDidDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateDidDto],
    }).compile();

    classObj = module.get<CreateDidDto>(CreateDidDto);
    validCreateCert = {
      secret: 'This is a secret invite code',
      publicKeyJwk: 'This is a public key',
      publicKeyType: 'rsa',
      identifier: 'TestIdentifier',
    };
  });

  it('valid add cert', () => {
    expect.assertions(1);
    return expect(
      validateOrReject(plainToClass(CreateDidDto, validCreateCert)),
    ).resolves.toBeUndefined();
  });

  it('invalid add cert: secret is not a string.', () => {
    const invalidCreateCert = {
      secret: 1234,
      publicKey: 'This is a public key',
      publicKeyType: 'rsa',
      identifier: 'TestIdentifier',
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: secret is too long.', () => {
    const invalidCreateCert = validCreateCert;
    invalidCreateCert.secret =
      'MIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBuQ4tFu+y+/rvY1xfnUnqI\n' +
      'QllbAfWZkA9rdNsDf2y9e5Q03clvnX8lq2buHIRRInIl1GCB02YHxHvfaD1N1MRZ\n' +
      'ZvXpLkvO1ylGvat6awHAq5cAZPRaK8jXveBTicrmvd+pJOJethpNpNH7Ugkpb6cE\n' +
      'kFaCppaKx3zjC0qThf6xJNGSJVjNGiXZEjsKfT/vFlma5P+FZ1FHRue29BHzmuWd\n' +
      'ngioENFO6WTNeVAlfmRU6/PtF6kM0vTbr+gAgfzdjqhylMsqyhX0ZGSzhuw9A3ru\n' +
      'rAW/lBi6x4GUC56qdXEYivuLBx+j5KxgO/Jy/mRrCCkv/RMWvkVFARvF9lU/JFY7\n' +
      'qiJX9ePM2PgTOV7aCb/7RoZFHePSHAouEn1Sb7lh7v7ZAj3GpDmDkKh0iY9Xza1T\n' +
      'vsXw2HGvMg8B/sVbYQqHx2FH1dG/VDz6G4aq3z+a3R8JtdSsTV52x3F+YjYKuubA\n' +
      'J09mV3GNcZffQD60/+vYUXbQljvAagcA5YzvauhoMCxux0sGaiX2NhHBR5Vfmn/O\n' +
      'TOd14HlS7Ipydd3M5GFdNqs45jL9lyI+ooO6eLQU52HV1xUIF3Pg1qK1COvt9Qm2\n' +
      'uZ0eL0tyBgvD+fW+Ns0dBdL31W4JPOGgQ+bvNdCMdjuCox5Mp9jfyygcmFupnC+g\n' +
      'MfkjCCwybZRJE6UVXG2YzwIDAQABMIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBuQ4tFu+y+/rvY1xfnUnqI\n' +
      'QllbAfWZkA9rdNsDf2y9e5Q03clvnX8lq2buHIRRInIl1GCB02YHxHvfaD1N1MRZ\n' +
      'ZvXpLkvO1ylGvat6awHAq5cAZPRaK8jXveBTicrmvd+pJOJethpNpNH7Ugkpb6cE\n' +
      'kFaCppaKx3zjC0qThf6xJNGSJVjNGiXZEjsKfT/vFlma5P+FZ1FHRue29BHzmuWd\n' +
      'ngioENFO6WTNeVAlfmRU6/PtF6kM0vTbr+gAgfzdjqhylMsqyhX0ZGSzhuw9A3ru\n' +
      'rAW/lBi6x4GUC56qdXEYivuLBx+j5KxgO/Jy/mRrCCkv/RMWvkVFARvF9lU/JFY7\n' +
      'qiJX9ePM2PgTOV7aCb/7RoZFHePSHAouEn1Sb7lh7v7ZAj3GpDmDkKh0iY9Xza1T\n' +
      'vsXw2HGvMg8B/sVbYQqHx2FH1dG/VDz6G4aq3z+a3R8JtdSsTV52x3F+YjYKuubA\n' +
      'J09mV3GNcZffQD60/+vYUXbQljvAagcA5YzvauhoMCxux0sGaiX2NhHBR5Vfmn/O\n' +
      'TOd14HlS7Ipydd3M5GFdNqs45jL9lyI+ooO6eLQU52HV1xUIF3Pg1qK1COvt9Qm2\n' +
      'uZ0eL0tyBgvD+fW+Ns0dBdL31W4JPOGgQ+bvNdCMdjuCox5Mp9jfyygcmFupnC+g\n' +
      'MfkjCCwybZRJE6UVXG2YzwIDAQAB';
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: publicKey is not a string.', () => {
    const invalidCreateCert = {
      secret: 'This is a secret invite code',
      publicKey: 1234,
      publicKeyType: 'rsa',
      identifier: 'TestIdentifier',
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: publicKey is too long.', () => {
    const invalidCreateCert = validCreateCert;
    invalidCreateCert.publicKeyJwk =
      'MIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBuQ4tFu+y+/rvY1xfnUnqI\n' +
      'QllbAfWZkA9rdNsDf2y9e5Q03clvnX8lq2buHIRRInIl1GCB02YHxHvfaD1N1MRZ\n' +
      'ZvXpLkvO1ylGvat6awHAq5cAZPRaK8jXveBTicrmvd+pJOJethpNpNH7Ugkpb6cE\n' +
      'kFaCppaKx3zjC0qThf6xJNGSJVjNGiXZEjsKfT/vFlma5P+FZ1FHRue29BHzmuWd\n' +
      'ngioENFO6WTNeVAlfmRU6/PtF6kM0vTbr+gAgfzdjqhylMsqyhX0ZGSzhuw9A3ru\n' +
      'rAW/lBi6x4GUC56qdXEYivuLBx+j5KxgO/Jy/mRrCCkv/RMWvkVFARvF9lU/JFY7\n' +
      'qiJX9ePM2PgTOV7aCb/7RoZFHePSHAouEn1Sb7lh7v7ZAj3GpDmDkKh0iY9Xza1T\n' +
      'vsXw2HGvMg8B/sVbYQqHx2FH1dG/VDz6G4aq3z+a3R8JtdSsTV52x3F+YjYKuubA\n' +
      'J09mV3GNcZffQD60/+vYUXbQljvAagcA5YzvauhoMCxux0sGaiX2NhHBR5Vfmn/O\n' +
      'TOd14HlS7Ipydd3M5GFdNqs45jL9lyI+ooO6eLQU52HV1xUIF3Pg1qK1COvt9Qm2\n' +
      'uZ0eL0tyBgvD+fW+Ns0dBdL31W4JPOGgQ+bvNdCMdjuCox5Mp9jfyygcmFupnC+g\n' +
      'MfkjCCwybZRJE6UVXG2YzwIDAQABMIICITANBgkqhkiG9w0BAQEFAAOCAg4AMIICCQKCAgBuQ4tFu+y+/rvY1xfnUnqI\n' +
      'QllbAfWZkA9rdNsDf2y9e5Q03clvnX8lq2buHIRRInIl1GCB02YHxHvfaD1N1MRZ\n' +
      'ZvXpLkvO1ylGvat6awHAq5cAZPRaK8jXveBTicrmvd+pJOJethpNpNH7Ugkpb6cE\n' +
      'kFaCppaKx3zjC0qThf6xJNGSJVjNGiXZEjsKfT/vFlma5P+FZ1FHRue29BHzmuWd\n' +
      'ngioENFO6WTNeVAlfmRU6/PtF6kM0vTbr+gAgfzdjqhylMsqyhX0ZGSzhuw9A3ru\n' +
      'rAW/lBi6x4GUC56qdXEYivuLBx+j5KxgO/Jy/mRrCCkv/RMWvkVFARvF9lU/JFY7\n' +
      'qiJX9ePM2PgTOV7aCb/7RoZFHePSHAouEn1Sb7lh7v7ZAj3GpDmDkKh0iY9Xza1T\n' +
      'vsXw2HGvMg8B/sVbYQqHx2FH1dG/VDz6G4aq3z+a3R8JtdSsTV52x3F+YjYKuubA\n' +
      'J09mV3GNcZffQD60/+vYUXbQljvAagcA5YzvauhoMCxux0sGaiX2NhHBR5Vfmn/O\n' +
      'TOd14HlS7Ipydd3M5GFdNqs45jL9lyI+ooO6eLQU52HV1xUIF3Pg1qK1COvt9Qm2\n' +
      'uZ0eL0tyBgvD+fW+Ns0dBdL31W4JPOGgQ+bvNdCMdjuCox5Mp9jfyygcmFupnC+g\n' +
      'MfkjCCwybZRJE6UVXG2YzwIDAQAB';
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: identifier is not a string.', () => {
    const invalidCreateCert = {
      secret: 'This is a secret invite code',
      publicKey: 'This is a public key',
      publicKeyType: 'rsa',
      identifier: 1234,
    };
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: identifier is too short.', () => {
    const invalidCreateCert = validCreateCert;
    invalidCreateCert.identifier = 'AB';
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });

  it('invalid add cert: identifier is too long.', () => {
    const invalidCreateCert = validCreateCert;
    invalidCreateCert.identifier =
      '012345678910111213141516171819202122232425262728293031323333435363738394041424344454647484950';
    expect.assertions(1);
    return expect(
      validate(plainToClass(CreateDidDto, invalidCreateCert)),
    ).resolves.toBeDefined();
  });
});
