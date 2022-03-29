import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e parse test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/parse/src/**',
    '!<rootDir>/apps/parse/src/*.*.spec.ts',
    '!<rootDir>/apps/parse/src/**/*.*.spec.ts',
    '!<rootDir>/apps/parse/src/main.ts',
  ],
  roots: ['<rootDir>/apps/parse/', '<rootDir>/libs/'],
};

export default config;
