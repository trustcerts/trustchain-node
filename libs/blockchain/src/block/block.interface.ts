import { ProposedBlock } from './proposed-block.dto';
import { ProposedSignatures } from './proposed-signatures.dto';

/**
 * Interface that combines a proposed block with the signatures to become a valid block.
 */
export interface Block extends ProposedBlock, ProposedSignatures {}
