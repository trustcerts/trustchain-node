import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e http-gateway test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/http-gateway/src/**',
    '!<rootDir>/apps/http-gateway/src/*.*.spec.ts',
    '!<rootDir>/apps/http-gateway/src/**/*.*.spec.ts',
    '!<rootDir>/apps/http-gateway/src/main.ts',
  ],
  roots: ['<rootDir>/apps/http-gateway/', '<rootDir>/libs/'],
};

export default config;
