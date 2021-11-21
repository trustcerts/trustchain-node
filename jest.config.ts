import type {Config} from '@jest/types';
import jestConfig from './jest.sharedConfig';


/**
 * an object to configure jest 
 */
const config: Config.InitialOptions = {
  ...jestConfig,
  rootDir:'.',
  projects:[
    "<rootDir>/jest.e2e.ts",
    "<rootDir>/jest.unit.ts"
  ]
};

export default config;
