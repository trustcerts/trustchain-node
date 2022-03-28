import * as Joi from 'joi';

/**
 * validation rules for the database connection values.
 */
export const dbConnectionValidation = {
  DB_DATABASE: Joi.string().default('nest'),
  DB_TYPE: Joi.string().valid('mongo').default('mongo'),
  DB_HOST: Joi.when('DB_TYPE', {
    is: Joi.equal('mongo'),
    then: Joi.string().default('db'),
    otherwise: Joi.optional(),
  }),
  DB_PORT: Joi.when('DB_TYPE', {
    is: Joi.equal('mongo'),
    then: Joi.number().default(27017),
    otherwise: Joi.optional(),
  }),
  DB_USERNAME: Joi.when('DB_TYPE', {
    is: Joi.equal('mongo'),
    then: Joi.string(),
    otherwise: Joi.optional(),
  }),
  DB_PASSWORD: Joi.when('DB_TYPE', {
    is: Joi.equal('mongo'),
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
