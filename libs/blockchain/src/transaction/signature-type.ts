/**
 * Types of the signature combinations of a transaction.
 */
export enum SignatureType {
  /**
   * Single signature.
   */
  Single = 'Single',
  // TODO define how many signatures are required for a valid multi signature.
  /**
   * Multi signature
   */
  Multi = 'Multi',
}
