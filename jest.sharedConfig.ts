import path from 'path';

export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  globals: {
    __storage: `${__dirname}/storage`,
  },
  verbose: false,
  testEnvironment: 'node',
  moduleNameMapper: {
    '@apps/(.*)': '<rootDir>/apps/$1',
    '@shared/(.*)': '<rootDir>/apps/shared/$1',
    '@test/(.*)': '<rootDir>/test/$1',
    '@tc/config(.*)': '<rootDir>/libs/config/src$1',
    '@tc/blockchain(.*)': '<rootDir>/libs/blockchain/src$1',
    '@tc/hash(.*)': '<rootDir>/libs/hash/src$1',
    '@tc/invite(.*)': '<rootDir>/libs/invite/src$1',
    '@tc/p2-p(.*)': '<rootDir>/libs/p2-p/src$1',
    '@tc/security(.*)': '<rootDir>/libs/security/src$1',
    '@tc/wallet-client(.*)': '<rootDir>/libs/wallet-client/src$1',
    '@tc/persist-client(.*)': '<rootDir>/libs/persist-client/src$1',
    '@tc/parse-client(.*)': '<rootDir>/libs/parse-client/src$1',
    '@tc/network-client(.*)': '<rootDir>/libs/network-client/src$1',
    '@tc/event-client(.*)': '<rootDir>/libs/event-client/src$1',
    '@tc/parsing(.*)': '<rootDir>/libs/parsing/src$1',
    '@tc/network(.*)': '<rootDir>/libs/network/src$1',
    '@tc/did(.*)': '<rootDir>/libs/did/src$1',
    '@tc/vc(.*)': '<rootDir>/libs/vc/src$1',
    '@tc/template/(.*)': '<rootDir>/libs/template/src/$1',
    '@tc/template': '<rootDir>/libs/template/src',
  },
};
