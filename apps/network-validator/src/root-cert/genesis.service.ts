import { Block } from '@tc/blockchain/block/block.interface';
import { ConfigService } from '@tc/config/config.service';
import { Connection } from '../../../shared/connection';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { DidCreation, VerificationRelationshipType } from '@trustcerts/core';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { DidTransactionDto } from '@tc/did/dto/did.transaction.dto';
import { HashService } from '@tc/blockchain';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { NetworkService } from '@tc/network';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { RoleManageAddEnum } from '@tc/did/constants';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import {
  SignatureInfo,
  SignatureType,
} from '@tc/blockchain/transaction/transaction.dto';
import { WalletClientService } from '@tc/wallet-client';
import { lastValueFrom } from 'rxjs';

/**
 * Service to generate the first block of a chain.
 */
@Injectable()
export class GenesisService {
  /**
   * Array of the URLs of the nodes in the root cert.
   */
  private connections!: Connection[];

  /**
   * Creates a RootCertService.
   * @param configService
   * @param walletClientService
   * @param didCachedService
   * @param logger
   * @param httpService
   * @param hashService
   * @param networkService
   */
  constructor(
    private readonly configService: ConfigService,
    private readonly walletClientService: WalletClientService,
    private readonly didCachedService: DidCachedService,
    @Inject('winston') private readonly logger: Logger,
    private readonly httpService: HttpService,
    private readonly hashService: HashService,
    private readonly networkService: NetworkService,
  ) {}

  /**
   * Creates new genesis block.
   * @param peers
   */
  async requestGenesisBlock(peers: string[]): Promise<void> {
    this.connections = peers.map((peer) => {
      const connection = new Connection(this.logger, this.httpService);
      connection.peer = peer;
      return connection;
    });
    // waits until all nodes are online.
    await this.checkIfAvailable();
    this.logger.debug({
      message: 'get self signed certificates.',
      labels: { source: this.constructor.name },
    });

    // request all transactions
    const transactions: DidTransactionDto[] = await this.requestTransactions();

    // build genesis block
    const proposedBlock: ProposedBlock = {
      index: 1,
      previousHash: this.hashService.GENESIS_PREVIOUS_HASH,
      transactions,
      timestamp: new Date().toISOString(),
      hash: await this.hashService.hashTransactions(transactions),
      version: this.hashService.blockVersion,
    };

    // get signatures
    const signatures = await this.requestSignatures(proposedBlock);
    const proposer = signatures.shift()!;

    // build final block
    const block: Block = {
      ...proposedBlock,
      signatures,
      proposer,
    };

    this.logger.debug({
      message: 'share genesis block.',
      labels: { source: this.constructor.name },
    });
    await this.initNetwork(block);

    return this.checkIfReady().catch((err) => {
      this.logger.error({
        message: `consensus took to long to start: ${err}`,
        labels: { source: this.constructor.name },
      });
      return Promise.reject(err);
    });
  }

  /**
   * Checks if all nodes are available to generate a root certificate.
   */
  async checkIfAvailable() {
    const proms = this.connections.map((connection) =>
      connection.waitUntilHealthy(),
    );
    return Promise.all(proms);
  }

  /**
   * Checks if all nodes are already ready connected with enough validators to start the consensus. If one of them is not, all validators will be
   * requested after some time. If the approach fails too much, the promise is rejected.
   */
  checkIfReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all(this.connections.map(this.checkNode.bind(this))).then(
        () => {
          this.logger.info({
            message: 'all nodes are healthy',
            labels: { source: this.constructor.name },
          });
          // TODO give it some time so new proposers are set. Improve call by updating consensus
          setTimeout(() => {
            resolve();
          }, 2000);
        },
        (err) => {
          this.logger.error(err);
          reject();
        },
      );
    });
  }

  /**
   * Checks if the Validator is already healthy for the consensus.
   * @param connection
   */
  async checkNode(connection: Connection): Promise<any> {
    return lastValueFrom(
      this.httpService.get(
        `${await connection.getHttpEndpoint()}/mashed?amount=${
          this.connections.length - 1
        }`,
        {
          headers: {
            Authorization: `Bearer ${this.configService.getString(
              'NETWORK_SECRET',
            )}`,
          },
        },
      ),
    );
  }

  /**
   * Requests values from all validators.
   */
  private requestTransactions(): Promise<DidTransactionDto[]> {
    return Promise.all(
      this.connections.map(async (connection: Connection) => {
        this.logger.debug({
          message: `request transaction from ${connection.peer}`,
          labels: { source: this.constructor.name },
        });
        const response = await lastValueFrom(
          this.httpService.get<DidTransactionDto>(
            `${await connection.getHttpEndpoint()}/did/self`,
            {
              headers: {
                Authorization: `Bearer ${this.configService.getString(
                  'NETWORK_SECRET',
                )}`,
              },
            },
          ),
        );
        return response.data;
      }),
    );
  }

  /**
   * Requests values from all validators.
   */
  private requestSignatures(block: ProposedBlock): Promise<SignatureDto[]> {
    return Promise.all(
      this.connections.map(async (connection: Connection) => {
        this.logger.debug({
          message: `request signature from ${connection.peer}`,
          labels: { source: this.constructor.name },
        });
        const response = await lastValueFrom(
          this.httpService.post<SignatureDto>(
            `${await connection.getHttpEndpoint()}/did/sign`,
            block,
            {
              headers: {
                Authorization: `Bearer ${this.configService.getString(
                  'NETWORK_SECRET',
                )}`,
              },
            },
          ),
        );
        return response.data;
      }),
    );
  }

  /**
   * Shares new generates certificate so validators can store the keys.
   */
  private initNetwork(block: Block) {
    return Promise.all(
      this.connections.map(async (connection: Connection) => {
        return lastValueFrom(
          this.httpService.post(
            `${await connection.getHttpEndpoint()}/did/init?node=${this.configService.getString(
              'OWN_PEER',
            )}`,
            block,
            {
              headers: {
                Authorization: `Bearer ${this.configService.getString(
                  'NETWORK_SECRET',
                )}`,
              },
            },
          ),
        );
      }),
    );
  }

  /**
   * Returns a self signed certificate to put it in the first block.
   */
  async getSelfSigned(): Promise<DidTransactionDto> {
    // creates a new did
    const creation: DidCreation = {};
    if (this.configService.getString('DID') !== '') {
      creation.id = this.configService.getString('DID');
    }
    const did = DidIdRegister.create(creation);

    // passes the id to the wallet to add the keypair
    await this.walletClientService.setOwnInformation(did.id);
    // request the keypair
    const key = await this.walletClientService.getPublicKey();
    did.addKey(key.id.split('#')[1], key.value);
    did.addVerificationRelationship(
      key.id.split('#')[1],
      VerificationRelationshipType.modification,
    );
    did.addRole(RoleManageAddEnum.Validator);
    // TODO update endpoint if microservice is not api.
    did.addService(
      'name',
      //TODO set http or https based on env
      `${this.configService.getString('HTTP_ENDPOINT')}/did/resolve/${did.id}`,
      'resolver',
    );

    const didDocSignature: SignatureInfo = {
      type: SignatureType.single,
      values: [await this.walletClientService.signIssuer(did.getDocument())],
    };
    const transaction = new DidTransactionDto(
      did.getChanges(),
      didDocSignature,
    );
    transaction.signature.values.push(
      await this.walletClientService.signIssuer(
        this.didCachedService.getValues(transaction),
      ),
    );
    return transaction;
  }

  /**
   * Sends all transactions to the parse service.
   * @param block
   */
  async parseGenesisBlock(block: Block) {
    await this.networkService.addBlock(block);
  }

  /**
   * Signs the proposed genesis block.
   * @param block
   */
  signBlock(block: ProposedBlock): Promise<SignatureDto> {
    return this.walletClientService.signIssuer(block);
  }
}
