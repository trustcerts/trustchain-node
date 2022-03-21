import jestConfig from './jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure unit tests
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '.',
  testMatch: ['<rootDir>/apps/persist/src/*.service.spec.ts'],
};

export default config;
