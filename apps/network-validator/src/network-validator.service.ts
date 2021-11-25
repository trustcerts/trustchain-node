import { CONNECTION_ADDED } from '@tc/blockchain/blockchain.events';
import { Injectable } from '@nestjs/common';
import { P2PService } from '@tc/p2-p';

/**
 * Given required functions to interact with the network.
 */
@Injectable()
export class NetworkValidatorService {
  /**
   * Inject required services.
   * @param p2PService
   */
  constructor(private readonly p2PService: P2PService) {}

  /**
   * Returns true if the node is connected with enough validators defined by the passed parameter.
   * @param amount
   */
  isMashed(amount: number): Promise<void> {
    return new Promise((resolve) => {
      const callback = () => {
        if (amount === this.p2PService.validatorConnections.length) {
          this.p2PService.connectionChanges.removeListener(
            CONNECTION_ADDED,
            callback,
          );
          resolve();
        }
      };
      this.p2PService.connectionChanges.on(CONNECTION_ADDED, callback);
      if (amount <= this.p2PService.validatorConnections.length) {
        this.p2PService.connectionChanges.removeListener(
          CONNECTION_ADDED,
          callback,
        );
        resolve();
      }
    });
  }
}
