import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Transport } from '@nestjs/microservices';
import { PublicKeyInformation } from '@tc/wallet-client/constants';
import { SYSTEM_RESET } from '@tc/event-client/constants';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import {
  WALLET_GET_ID,
  WALLET_PUB_KEY,
  WALLET_SET_ID,
  WALLET_SIGN,
} from '@tc/wallet-client/endpoints';
import { WalletService } from './wallet.service';

/**
 * Endpoint to interact with the wallet of a node. This service should only be accessible inside the node.
 */
@Controller()
export class WalletController {
  /**
   * Import required services.
   * @param walletService
   */
  constructor(private readonly walletService: WalletService) {}

  /**
   * Endpoint to sign the given values with the private key.
   * @param data
   */
  @MessagePattern(WALLET_SIGN, Transport.TCP)
  signTcp(data: string): Promise<SignatureDto> {
    return this.walletService.sign(data);
  }

  /**
   * Returns the own public key.
   */
  @MessagePattern(WALLET_PUB_KEY, Transport.TCP)
  publicKey(): Promise<PublicKeyInformation> {
    return this.walletService.getPublicKey();
  }

  /**
   * Returns the stored cert hash of the current public key.
   */
  @MessagePattern(WALLET_SET_ID, Transport.TCP)
  async setId(id: string) {
    await this.walletService.setOwnInformation(id);
  }

  /**
   * Returns the stored cert hash of the current public key.
   */
  @MessagePattern(WALLET_GET_ID, Transport.TCP)
  getId(): string {
    return this.walletService.getOwnInformation();
  }

  /**
   * Resets the service.
   */
  @EventPattern(SYSTEM_RESET, Transport.REDIS)
  reset() {
    this.walletService.reset();
  }
}
