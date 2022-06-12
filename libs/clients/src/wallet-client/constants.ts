/**
 * Interface of a exported json web key.
 */
export interface PublicKeyInformation {
  /**
   * unique identifier of the key. Starts with the id of the did and adds a fragment with the fingerprint of the key.
   */
  id: string;
  /**
   * Public key as a json web key.
   */
  value: JsonWebKey;
}

/**
 * Event to inform about a new set identifier.
 */
export const NEW_IDENTIFIER = 'NEW_IDENTIFIER';

/**
 * URL und PORTS for connections
 */
export const WALLET_URL = 'WALLET_URL',
  WALLET_PORT_HTTP = 'WALLET_PORT_HTTP',
  WALLET_PORT_TCP = 'WALLET_PORT_TCP';

/**
 * name of the wallet injection.
 */
export const WALLET_TCP_INJECTION = 'WALLET_TCP';
