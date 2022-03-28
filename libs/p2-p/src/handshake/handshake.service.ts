import { CONNECTION_CHALLENGE } from '@tc/blockchain/blockchain.events';
import { Connection } from '@shared/connection';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { WalletClientService } from '@tc/clients/wallet-client';
import { randomBytes } from 'crypto';

/**
 * Service to handle the handshake between two nodes.
 */
@Injectable()
export class HandshakeService {
  /**
   * Loads required services.
   * @param walletService
   * @param didCachedService
   * @param logger
   */
  constructor(
    private readonly walletService: WalletClientService,
    private readonly didCachedService: DidIdCachedService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Creates a challenge and sends it to the node that has to respond with a personal signature to proof the possession of the key. If the validation
   * fails, the method will return a rejection so the socket can be closed because the authentication failed.
   * @param endpoint
   */
  createChallenge(endpoint: Connection) {
    const cancelTime = 2000;
    return new Promise<void>((resolve, reject) => {
      const challenge = randomBytes(16).toString('hex');
      this.logger.debug({
        message: `${endpoint.identifier}: send challenge ${challenge}`,
        labels: {
          source: this.constructor.name,
          identifier: endpoint.identifier,
        },
      });
      endpoint.socket.emit(
        CONNECTION_CHALLENGE,
        challenge,
        (response: SignatureDto) => {
          clearTimeout(cancel);
          this.logger.debug({
            message: `${endpoint.identifier}: validate response`,
            labels: {
              source: this.constructor.name,
              identifier: endpoint.identifier,
            },
          });
          this.didCachedService
            .canUse(response.identifier, 'authentication')
            .then(async (key) => {
              if (!key) {
                throw Error(
                  `key ${response.identifier} can not be used for authentication`,
                );
              }
              // TODO check if key belongs to the did that wants to connect
              // TODO check that the key is allowed for authentication.
              this.walletService
                .checkSignature(key.publicKeyJwk, challenge, response.signature)
                .then(
                  () => {
                    this.logger.debug({
                      message: `${endpoint.identifier}: challenge is valid`,
                      labels: {
                        source: this.constructor.name,
                        identifier: endpoint.identifier,
                      },
                    });
                    resolve();
                  },
                  () => {
                    this.logger.warn({
                      message: `${endpoint.identifier}: challenge is wrong`,
                      labels: {
                        source: this.constructor.name,
                        identifier: endpoint.identifier,
                      },
                    });
                    reject();
                  },
                );
            })
            .catch((err: Error) => {
              this.logger.warn({
                message: `${endpoint.identifier}: ${err.message}`,
                labels: {
                  source: this.constructor.name,
                  identifier: endpoint.identifier,
                },
              });
              reject();
            });
        },
      );
      const cancel = setTimeout(() => {
        this.logger.warn({
          message: `${endpoint.identifier}: did not respond in time`,
          labels: {
            source: this.constructor.name,
            identifier: endpoint.identifier,
          },
        });
        reject();
      }, cancelTime);
    });
  }

  /**
   * Calculates the response to the challenge.
   * @param identifier
   * @param challenge
   */
  createResponse(identifier: string, challenge: string): Promise<SignatureDto> {
    this.logger.debug({
      message: `${identifier}: create the response`,
      labels: { source: this.constructor.name },
    });
    return this.walletService.sign(challenge);
  }
}
