import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';

/**
 * Signatures that will be attached to a block.
 */
export class ProposedSignatures {
  /**
   * signatures of the validators that accepted the block.
   */
  signatures!: SignatureDto[];

  /**
   * signature of the one who proposed the block
   */
  proposer!: SignatureDto;
}
