/**
 * Values to measure during the consensus.
 */
export interface Time {
  /**
   * Time how long the proposer will wait before generating a new block.
   */
  startDelay: number;

  /**
   * amount of transaction
   */
  blockIndex?: number;

  /**
   * amount of transaction that are in the block
   */
  blockTransactionCounter?: number;
}
