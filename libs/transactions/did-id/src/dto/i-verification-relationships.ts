/**
 * Interfaces of all verification relationships.
 */

export interface IVerificationRelationships {
  /**
   * keys that are used for authentication
   */
  authentication?: any;
  /**
   * keys that are used for assertion
   */
  assertionMethod?: any;
  // keyAgreement?: any;
  /**
   * keys that are used for updating the did document.
   */
  modification?: any;
}
