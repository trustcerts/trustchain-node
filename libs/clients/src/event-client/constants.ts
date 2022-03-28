/**
 * name of the redis injection.
 */
export const REDIS_INJECTION = 'REDIS';

/**
 * Event is fired when a transaction was created.
 */
export const TRANSACTION_CREATED = 'transaction_created';

/**
 * Event is fired when a transaction was parsed.
 */
export const TRANSACTION_PARSED = 'transaction_parsed';

/**
 * Event is fired when a transaction got rejected.
 */
export const TRANSACTION_REJECTED = 'transaction_rejected';

/**
 * Event is fired when all services should be reset themselves.
 */
export const SYSTEM_RESET = 'reset';

// TODO check if this should be an event or a TCP call for getting a response
/**
 * Event is fired when the system should be initialized.
 */
export const SYSTEM_INIT = 'init';

/**
 * Event is fired if a certificate got rejected and a possible connection has to
 * be closed.
 */
export const VALIDATE_CONNECTIONS = 'close_connection';
