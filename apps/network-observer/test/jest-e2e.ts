import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e network-observer test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/network-observer/src/**',
    '!<rootDir>/apps/network-observer/src/*.*.spec.ts',
    '!<rootDir>/apps/network-observer/src/**/*.*.spec.ts',
    '!<rootDir>/apps/network-observer/src/main.ts',
  ],
  roots: ['<rootDir>/apps/network-observer/', '<rootDir>/libs/'],
};

export default config;
