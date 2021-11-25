/**
 * name of the redis injection.
 */
export const REDIS_INJECTION = 'REDIS';
/**
 * Event is fired when a new block was created to get persisted and parsed.
 */
export const BLOCK_CREATED = 'block_created';

/**
 * Event is fired when a block was parsed.
 */
export const BLOCK_PARSED = 'block_parsed';

/**
 * Message request to receive a block.
 */
export const BLOCK_REQUEST = 'block_request';

/**
 * Message request to receive an amount of blocks.
 */
export const BLOCKS_REQUEST = 'blocks_request';

/**
 * Message request to receive the current block counter.
 */
export const BLOCK_COUNTER = 'block_counter';

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
 * Message request to rebuild the chain.
 */
export const CHAIN_REBUILD = 'chain_rebuild';

/**
 * Event is fired when all services should be reset themselves.
 */
export const SYSTEM_RESET = 'reset';

/**
 * Event is fired when the system should be initialized.
 */
export const SYSTEM_INIT = 'init';

/**
 * Message request to initialize everything for a new root certificate.
 */
export const CERT_ROOT_INIT = 'cert_root_init';

/**
 * Event is fired if a certificate got rejected and a possible connection has to
 * be closed.
 */
export const VALIDATE_CONNECTIONS = 'close_connection';
