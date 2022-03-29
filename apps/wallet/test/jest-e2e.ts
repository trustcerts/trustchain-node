import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e wallet test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/wallet/src/**',
    '!<rootDir>/apps/wallet/src/*.*.spec.ts',
    '!<rootDir>/apps/wallet/src/**/*.*.spec.ts',
    '!<rootDir>/apps/wallet/src/main.ts',
  ],
  roots: ['<rootDir>/apps/wallet/', '<rootDir>/libs/'],
};

export default config;
