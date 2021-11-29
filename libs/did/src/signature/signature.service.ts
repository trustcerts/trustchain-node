import { Block } from '@tc/blockchain/block/block.interface';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { WalletClientService } from '@tc/wallet-client';
import { sortKeys } from '@trustcerts/sdk';

/**
 * Bundles function to verify a signature.
 */
@Injectable()
export class SignatureService {
  /**
   * Injects required services.
   * @param didCachedService
   * @param walletClientService
   * @param logger
   */
  constructor(
    private readonly didCachedService: DidCachedService,
    private readonly walletClientService: WalletClientService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Validates if the signature belongs to the proposed block.
   * @param signature
   * @param block
   */
  public validateSignature(
    signature: SignatureDto,
    block: ProposedBlock,
  ): Promise<void> {
    return this.didCachedService.getKey(signature.identifier).then(
      async (key) => {
        const result = await this.walletClientService.checkSignature(
          key.publicKeyJwk,
          JSON.stringify(sortKeys(block)),
          signature.signature,
        );
        if (!result) {
          throw new Error(
            `signature does not match for block ${block.index} with signature from ${signature.identifier}`,
          );
        }
      },
      () => {
        throw new Error(`No valid certificate for ${signature.identifier}`);
      },
    );
  }

  /**
   * Validates if an array of signatures belongs to a given block.
   * @param block
   */
  public validateSignatures(block: Block) {
    return Promise.all(
      [...block.signatures, block.proposer].map((signature) => {
        const proposed = JSON.parse(JSON.stringify(block));
        proposed.signatures = undefined;
        proposed.proposer = undefined;
        return this.validateSignature(signature, proposed);
      }),
    );
  }
}