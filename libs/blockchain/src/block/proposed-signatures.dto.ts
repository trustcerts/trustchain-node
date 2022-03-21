import { Block } from './block.interface';

/**
 * Signatures that will be attached to a block.
 */
export type ProposedSignatures = Pick<Block, 'signatures' | 'proposer'>;
