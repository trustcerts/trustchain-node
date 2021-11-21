import * as Joi from 'joi';

/**
 * name of the persist injection.
 */
export const PERSIST_TCP_INJECTION = 'PERSIST_TCP';
/**
 * name of the parse injection.
 */
export const PARSE_TCP_INJECTION = 'PARSE_TCP';
/**
 * name of the network injection.
 */
export const NETWORK_TCP_INJECTION = 'NETWORK_TCP';
/**
 * name of the wallet injection.
 */
export const WALLET_TCP_INJECTION = 'WALLET_TCP';
/**
 * validation rules for the database connection values.
 */
export const dbConnectionValidation = {
  DB_DATABASE: Joi.string(),
  DB_TYPE: Joi.string().valid('mysql').default('mysql'),
  DB_HOST: Joi.when('DB_TYPE', {
    is: Joi.equal('mysql'),
    then: Joi.string().default('db'),
    otherwise: Joi.optional(),
  }),
  DB_PORT: Joi.when('DB_TYPE', {
    is: Joi.equal('mysql'),
    then: Joi.number().default(3306),
    otherwise: Joi.optional(),
  }),
  DB_USERNAME: Joi.when('DB_TYPE', {
    is: Joi.equal('mysql'),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }),
  DB_PASSWORD: Joi.when('DB_TYPE', {
    is: Joi.equal('mysql'),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }),
  // TODO set to false to minimize the risc
  DB_SYNC: Joi.boolean().default(true),
};
/**
 * validation rules for network services.
 */
export const networkValidation = {
  NETWORK_SECRET: Joi.string(),
  RECONNECT: Joi.boolean().default(true),
  REJECT_UNAUTHORIZED: Joi.boolean().default(false),
  CHUNK_SIZE: Joi.number().default(10),
};

/**
 * validation rules for network services for dynamic values.
 */
export const networkDynamicValidation = {
  VALIDATORS: Joi.array().items(Joi.string()),
  IDENTIFIER: Joi.string(),
};

/**
 * validation rules for the http services.
 */
export const httpValidation = {
  RESET: Joi.boolean().default(false),
  NETWORK_SECRET: Joi.string(),
  NODE_SECRET: Joi.string(),
  REJECT_UNAUTHORIZED: Joi.boolean().default(false),
};

/**
 * dynamic validation rules for http endpoints.
 */
export const dynamicHttpValidation = {
  MAINTENANCE: Joi.boolean().default(false),
  IDENTIFIER: Joi.string(),
};
