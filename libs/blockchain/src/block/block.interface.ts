import { ArrayMinSize, IsArray } from 'class-validator';
import { ProposedBlock } from './proposed-block.dto';
import { SignatureDto } from '../transaction/signature.dto';
import { Type } from 'class-transformer';

/**
 * Interface that combines a proposed block with the signatures to become a valid block.
 */
export class Block extends ProposedBlock {
  /**
   * signatures of the validators that accepted the block.
   */
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => SignatureDto)
  signatures!: SignatureDto[];

  /**
   * signature of the one who proposed the block
   */
  // TODO move this signature to the other signature array
  @Type(() => SignatureDto)
  proposer!: SignatureDto;

  /**
   * Signatures of the state proof
   */
  @IsArray()
  @Type(() => SignatureDto)
  stateSignatures?: SignatureDto[];
}
