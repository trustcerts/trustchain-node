import jestConfig from './jest.sharedConfig';
import type { Config } from '@jest/types';
// Sync object

/**
 * an object to configure e2e tests
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir: '.',
  globals: {
    isE2E: true,
    __storage: `${__dirname}/storage`,
  },
  testMatch: [
    '<rootDir>/apps/persist/test/*.e2e-spec.ts',
    '<rootDir>/apps/parse/test/*.e2e-spec.ts',
    '<rootDir>/apps/wallet/test/*.e2e-spec.ts',
    '<rootDir>/apps/http-gateway/test/*.e2e-spec.ts',
    '<rootDir>/apps/http-observer/test/*.e2e-spec.ts',
    '<rootDir>/apps/http-validator/test/*.e2e-spec.ts',
    '<rootDir>/apps/network-gateway/test/*.e2e-spec.ts',
    '<rootDir>/apps/network-observer/test/*.e2e-spec.ts',
    '<rootDir>/apps/network-validator/test/*.e2e-spec.ts',
  ],
};

export default config;
