import { Time } from '../time.interface';

/**
 * Values to measure during the consensus.
 */
export interface ProposerTime extends Time {
  /**
   * How much time needed the proposer to generate the block.
   */
  generatingTime?: number;
  /**
   * How long has the Validator waited to get the other signatures for the proposed block.
   */
  waitingSignatures: { time: number; identifier: string }[];
  /**
   * Time of the validation of the signature.
   */
  persistingTime?: number;
}
