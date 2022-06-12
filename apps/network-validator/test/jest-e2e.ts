import jestConfig from '../../../jest.sharedConfig';
import type { Config } from '@jest/types';

/**
 * an object to configure e2e network-validator test
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '../../../',
  testRegex: '.e2e-spec.ts$',
  collectCoverageFrom: [
    '<rootDir>/apps/network-validator/src/**',
    '!<rootDir>/apps/network-validator/src/*.*.spec.ts',
    '!<rootDir>/apps/network-validator/src/**/*.*.spec.ts',
    '!<rootDir>/apps/network-validator/src/main.ts',
  ],
  roots: ['<rootDir>/apps/network-validator/', '<rootDir>/libs/'],
};

export default config;
