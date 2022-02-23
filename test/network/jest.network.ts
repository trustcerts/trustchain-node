import type { Config } from '@jest/types';
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
};

export default config;
