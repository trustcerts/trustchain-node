/**
 * Relationships of a verification key.
 */
export class VerificationRelationships {
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
