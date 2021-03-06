import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e network-gateway test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/network-gateway/src/**',
    '!<rootDir>/apps/network-gateway/src/*.*.spec.ts',
    '!<rootDir>/apps/network-gateway/src/**/*.*.spec.ts',
    '!<rootDir>/apps/network-gateway/src/main.ts',
  ],
  roots: ['<rootDir>/apps/network-gateway/', '<rootDir>/libs/'],
};

export default config;
