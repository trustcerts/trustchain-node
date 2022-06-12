import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e persist test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/persist/src/**',
    '!<rootDir>/apps/persist/src/*.*.spec.ts',
    '!<rootDir>/apps/persist/src/**/*.*.spec.ts',
    '!<rootDir>/apps/persist/src/main.ts',
  ],
  roots: ['<rootDir>/apps/persist/', '<rootDir>/libs/'],
};

export default config;
