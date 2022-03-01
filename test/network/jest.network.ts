import type { Config } from '@jest/types';
import jestConfig from '../../jest.sharedConfig';
// Sync object

/**
 * an object to configure network test
 */
const config: Config.InitialOptions = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  verbose: false,
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/network.test.ts'],
  moduleNameMapper: {
    '@tc/did-id(.*)': '../../libs/transactions/did-id/src$1',

  },
};

export default config;
