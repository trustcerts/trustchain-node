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
  detectOpenHandles: true,
  forceExit: true,
  moduleNameMapper: {
    '@apps/(.*)': '<rootDir>/apps/$1',
    '@shared/(.*)': '<rootDir>/apps/shared/$1',
    '@test/(.*)': '<rootDir>/test/$1',
    '@tc/config(.*)': '<rootDir>/libs/config/src$1',
    '@tc/blockchain(.*)': '<rootDir>/libs/blockchain/src$1',
    '@tc/invite(.*)': '<rootDir>/libs/invite/src$1',
    '@tc/p2-p(.*)': '<rootDir>/libs/p2-p/src$1',
    '@tc/wallet-client(.*)': '<rootDir>/libs/clients/wallet-client/src$1',
    '@tc/persist-client(.*)': '<rootDir>/libs/clients/persist-client/src$1',
    '@tc/parse-client(.*)': '<rootDir>/libs/clients/parse-client/src$1',
    '@tc/network-client(.*)': '<rootDir>/libs/clients/network-client/src$1',
    '@tc/event-client(.*)': '<rootDir>/libs/clients/event-client/src$1',
    '@tc/transactions(.*)': '<rootDir>/libs/transactions/src/$1',
  },
};
