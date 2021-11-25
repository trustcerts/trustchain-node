import { Time } from '../time.interface';

/**
 * Values to measure during the consensus.
 */
export interface ValidatorTime extends Time {
  /**
   * How log has the Validator waited for the new block.
   */
  waitForBlock?: number;

  /**
   * maximum time to wait for a new block.
   */
  waitForBlockTimeout?: number;

  /**
   * Time of own validation of the block.
   */
  validationTime?: number;
  /**
   * How long has the Validator waited to get the other signatures for the proposed block.
   */
  waitForSignature?: number;
  /**
   * Time of the validation of the signature.
   */
  persistingTime?: number;
}
