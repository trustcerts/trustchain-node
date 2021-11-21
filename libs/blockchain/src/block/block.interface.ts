import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { ProposedSignatures } from '@tc/blockchain/block/proposed-signatures.dto';

/**
 * Interface that combines a proposed block with the signatures to become a valid block.
 */
export interface Block extends ProposedBlock, ProposedSignatures {}
