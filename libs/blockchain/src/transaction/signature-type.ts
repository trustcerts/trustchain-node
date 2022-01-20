/**
 * Types of the signature combinations of a transaction.
 */
export enum SignatureType {
  /**
   * Single signature.
   */
  single = 'single',
  // TODO define how many signatures are required for a valid multi signature.
  /**
   * Multi signature
   */
  multi = 'multi',
}
