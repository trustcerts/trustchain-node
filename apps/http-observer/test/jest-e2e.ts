import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e http-observer test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/http-observer/src/**',
    '!<rootDir>/apps/http-observer/src/*.*.spec.ts',
    '!<rootDir>/apps/http-observer/src/**/*.*.spec.ts',
    '!<rootDir>/apps/http-observer/src/main.ts',
  ],
  roots: ['<rootDir>/apps/http-observer/', '<rootDir>/libs/'],
};

export default config;
