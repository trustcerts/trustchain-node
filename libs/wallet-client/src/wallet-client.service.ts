import { ClientTCP, RpcException } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import { Connection } from '@shared/connection';
import { CreateDidDto } from '@shared/create-did.dto';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { InviteNode } from '@tc/invite/dto/invite-node.dto';
import { Logger } from 'winston';
import { PublicKeyInformation } from '@tc/wallet-client/constants';
import { PublicKeyJwkDto } from '@tc/did/dto/public-key-jwk.dto';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import {
  WALLET_GET_ID,
  WALLET_PUB_KEY,
  WALLET_SET_ID,
  WALLET_SIGN,
} from '@tc/wallet-client/endpoints';
import { WALLET_TCP_INJECTION } from '@shared/constants';
import { importKey, sortKeys, verifySignature } from '@trustcerts/sdk';
import { lastValueFrom } from 'rxjs';

/**
 * Service to interact with the wallet service of basic functions to deal with cryptographic functions like validating a signature.
 */
@Injectable()
export class WalletClientService implements OnModuleDestroy {
  /**
   * Hashing algorithm that should be used.
   */
  public static defaultHashAlgorithm = 'sha256';

  /**
   * Imports required services.
   * @param clientWallet
   * @param logger
   * @param configService
   * @param httpService
   */
  constructor(
    @Inject(WALLET_TCP_INJECTION) private clientWallet: ClientTCP,
    @Inject('winston') private readonly logger: Logger,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Checks a given input is signed by a given key.
   * @param publicKey
   * @param {string} input
   * @param {string} signature
   */
  public async checkSignature(
    publicKey: PublicKeyJwkDto,
    input: string,
    signature: string,
  ): Promise<boolean> {
    const key = await this.importKey(publicKey);
    return verifySignature(input, signature, key);
  }

  /**
   * Imports the crypto key object from a jwk string
   * @param keyValue
   * @private
   */
  public importKey(keyValue: PublicKeyJwkDto): Promise<CryptoKey> {
    return importKey(keyValue, 'jwk', ['verify']);
  }

  /**
   * Returns the public key
   */
  getPublicKey(): Promise<PublicKeyInformation> {
    return lastValueFrom(
      this.clientWallet.send<PublicKeyInformation>(WALLET_PUB_KEY, {}),
    );
  }

  /**
   * Returns information to identify the issuer.
   */
  async getOwnInformation(): Promise<string> {
    return lastValueFrom(this.clientWallet.send<string>(WALLET_GET_ID, {}));
  }

  /**
   * Returns information to identify the issuer.
   */
  async setOwnInformation(id: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.clientWallet.send<string>(WALLET_SET_ID, id).subscribe({
        complete: () => resolve(),
      });
    });
  }

  /**
   * Signs a given string.
   * @param {string} input
   * @returns {string}
   */
  public async sign(input: string): Promise<SignatureDto> {
    return lastValueFrom(
      this.clientWallet.send<SignatureDto>(WALLET_SIGN, input),
    );
  }

  /**
   * Converts a nested object to an ordered json string and signs it.
   * @param value
   */
  async signIssuer(value: any): Promise<SignatureDto> {
    return this.sign(JSON.stringify(sortKeys(value)));
  }

  /**
   * Requests a signed did to be added to the network.
   */
  async requestSignedDid(invite: InviteNode): Promise<string[]> {
    this.logger.debug({
      message: `request cert with code: ${invite.secret}`,
      labels: { source: this.constructor.name },
    });
    const connection = new Connection(this.logger, this.httpService);
    connection.peer = invite.url;
    await connection.waitUntilHealthy();

    // set the new did
    await this.setOwnInformation(invite.id);

    const key = await this.getPublicKey();
    const create: CreateDidDto = {
      secret: invite.secret,
      identifier: await this.getOwnInformation(),
      publicKey: key.value,
    };
    try {
      const response = await lastValueFrom(
        this.httpService.post<string[]>(
          `${await connection.getHttpEndpoint()}/did/create`,
          create,
          {
            headers: {
              Authorization: `Bearer ${this.configService.getString(
                'NETWORK_SECRET',
              )}`,
            },
          },
        ),
      );

      this.logger.debug({
        message: `got endpoints: ${response.data}`,
        labels: { source: this.constructor.name },
      });
      return response.data;
    } catch (err: any) {
      this.logger.error({
        message: JSON.stringify(err.response.data),
        labels: { source: this.constructor.name },
      });
      throw new RpcException(err);
    }
  }

  /**
   * Will close the connection when the application shuts down.
   */
  onModuleDestroy() {
    this.clientWallet.close();
  }
}
