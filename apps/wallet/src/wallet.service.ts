import * as fs from 'fs';
import { ClientRedis } from '@nestjs/microservices';
import { ConfigService } from '@tc/config';
import {
  CryptoService,
  DecryptedKeyPair,
  generateKeyPair,
} from '@trustcerts/core';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import {
  NEW_IDENTIFIER,
  PublicKeyInformation,
} from 'libs/clients/wallet-client/src/constants';
import { REDIS_INJECTION } from 'libs/clients/event-client/src/constants';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { join } from 'path';

/**
 * add id
 * add keypair with fingerprint (wallet)
 * add a did transaction (this step is done by the http module since the transaction has to be signed)
 * request signature from wallet
 * send transaction to persist it
 */

/**
 * Service that is used to send transactions to the validators and responds to the Client.
 */
@Injectable()
export class WalletService {
  /**
   * Name of the key files.
   * @private
   */
  private keyFile = 'wallet.json';

  /**
   * Service from the shared crypto library.
   * @private
   */
  private cryptoService!: CryptoService;

  /**
   * Loads keys and generates a key pair that will be used.
   * @param configService
   * @param clientRedis
   * @param logger
   */
  constructor(
    private readonly configService: ConfigService,
    @Inject(REDIS_INJECTION) private readonly clientRedis: ClientRedis,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.cryptoService = new CryptoService();
    this.init().then();
  }

  /**
   * Load a keypair from the file system. If it does not exist, add one.
   * @private
   */
  private async init() {
    if (this.keysExists()) {
      this.cryptoService.init(this.loadKeys()).then(() => {
        this.logger.info({
          message: 'keys loaded',
          labels: { source: this.constructor.name },
        });
      });
    }
  }

  /**
   * Signs a given string
   * @param {string} input
   * @returns {string}
   */
  public async sign(input: string): Promise<SignatureDto> {
    return {
      identifier: this.cryptoService.fingerPrint,
      signature: await this.cryptoService.sign(input),
    };
  }

  /**
   * Sets the new id and generates a new keypair that uses this id. Fires an event to redis to inform all services.
   * @param id
   */
  async setOwnInformation(id: string) {
    this.configService.setConfig('IDENTIFIER', id);
    this.clientRedis.emit(NEW_IDENTIFIER, id);
    const keyPair = await generateKeyPair(id);
    this.addKey(keyPair);
    await this.init();
  }

  /**
   * Returns information to identify the issuer.
   */
  getOwnInformation(): string {
    this.logger.debug({
      message: 'get info',
      labels: { source: this.constructor.name },
    });
    return this.configService.getConfig('IDENTIFIER');
  }

  /**
   * Returns the public key.
   */
  public async getPublicKey(): Promise<PublicKeyInformation> {
    return {
      id: this.cryptoService.fingerPrint,
      value: await this.cryptoService.getPublicKey(),
    };
  }

  /**
   * Checks if there are local keys that can be used in the future.
   */
  private keysExists() {
    return fs.existsSync(join(this.configService.storagePath, this.keyFile));
  }

  /**
   * Loads the keys from the local file storage.
   */
  private loadKeys(): DecryptedKeyPair {
    // TODO implement function to encrypt key file
    return JSON.parse(
      fs.readFileSync(
        join(this.configService.storagePath, this.keyFile),
        'utf-8',
      ),
    );
  }

  /**
   * Safes the keypair to the file.
   * @param keyPair
   * @private
   */
  private addKey(keyPair: DecryptedKeyPair) {
    // TODO implement function to encrypt key file
    // TODO store multiple keys
    fs.writeFileSync(
      join(this.configService.storagePath, this.keyFile),
      JSON.stringify(keyPair),
    );
  }

  /**
   * Resets the wallet service by removing all values.
   */
  reset() {
    this.logger.info({
      message: 'reset',
      labels: { source: this.constructor.name },
    });
    this.configService.removeConfig('IDENTIFIER');
    this.cryptoService = new CryptoService();
    if (fs.existsSync(join(this.configService.storagePath, this.keyFile))) {
      fs.unlinkSync(join(this.configService.storagePath, this.keyFile));
    }
  }
}
