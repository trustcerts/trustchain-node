/**
 * Name of the message to get more validators.
 */
export const CONNECTION_VALIDATORS_RESPONSE = 'validators_response';

/**
 * Name of the message to request more validators.
 */
export const CONNECTION_VALIDATORS_REQUEST = 'validators_request';

/**
 * Name of the message to make a challenge response.
 */
export const CONNECTION_CHALLENGE = 'challenge';

/**
 * Name of the event for an added connection.
 */
export const CONNECTION_ADDED = 'connection_added';
/**
 * Name of the event for a removed connection
 */
export const CONNECTION_REMOVED = 'connection_removed';

/**
 * Name of the event for a filled transaction list.
 */
export const LIST_NOT_EMPTY = 'filled';

/**
 * Name of the event for a proposed block.
 */
export const WS_BLOCK_PROPOSE = 'propose';

/**
 * Name of the event for the commit of a block.
 */
export const WS_BLOCK_COMMIT = 'commit';

/**
 * Name of the event for a block to be persisted.
 */
export const WS_BLOCK_PERSIST = 'persist';

/**
 * Name of the event for a transaction.
 */
export const WS_TRANSACTION = 'transaction';

/**
 * Name of the event for a transaction.
 */
export const WS_TRANSACTION_REJECTED = 'transaction rejected';

/**
 * Name of the event for a block.
 */
export const WS_BLOCK = 'block';

/**
 * Name for the event to sync up the chain
 */
export const WS_BLOCK_MISSING = 'block_missing';

/**
 * Name of the event to ask for the current proposer.
 */
export const REQUEST_ROUND_NUMBER = 'current_proposer_request';

/**
 * Name of the event to respond with the current proposer.
 */
export const RESPONSE_ROUND_NUMBER = 'current_proposer_response';

/**
 * Name of the event when a group of validators want to reset the consensus because they are out of sync.
 */
export const CONSENSUS_RESET = 'consensus_reset';

/**
 * Name of the event request when a Validator is ready to be party in the consensus.
 */
export const CONSENSUS_READY_REQUEST = 'consensus_ready_request';

/**
 * Name of the event response when a Validator is ready to be party in the consensus.
 */
export const CONSENSUS_READY_RESPONSE = 'consensus_ready_response';

/**
 * Name of the event when the servers checks if all events are registered at the endpoint.
 */
export const IS_ENDPOINT_LISTENING_FOR_BLOCKS = 'is_listening_for_blocks';

/**
 * Name of the event when the endpoint registered all events.
 */
export const ENDPOINT_LISTENING_FOR_BLOCKS = 'listening_for_blocks';
/**
 * Name of the event when the servers checks if all events are registered at the endpoint.
 */
export const IS_ENDPOINT_LISTENING_FOR_VALIDATORS =
  'is_listening_for_validators';

/**
 * Name of the event when the endpoint registered all events.
 */
export const ENDPOINT_LISTENING_FOR_VALIDATORS = 'listening_for_validators';
