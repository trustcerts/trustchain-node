import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e http-validator test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/http-validator/src/**',
    '!<rootDir>/apps/http-validator/src/*.*.spec.ts',
    '!<rootDir>/apps/http-validator/src/**/*.*.spec.ts',
    '!<rootDir>/apps/http-validator/src/main.ts',
  ],
  roots: ['<rootDir>/apps/http-validator/', '<rootDir>/libs/'],
};

export default config;
