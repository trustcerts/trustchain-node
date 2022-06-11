import { CachedService } from '@tc/transactions/transactions/cache.service';
import { ConfigService } from '@tc/config';
import { ConflictException } from '@nestjs/common';
import { DidResolver, VerifierService } from '@trustcerts/did';
import { GatewayBlockchainService } from './gateway-blockchain/gateway-blockchain.service';
import { Logger } from 'winston';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { TransactionCheck } from '@tc/transactions/transactions/transaction-check.service';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { WalletClientService } from '@tc/clients/wallet-client';

/**
 * Base Service to add a transaction.
 */
export class GatewayTransactionService<
  Res extends DidResolver<VerifierService>,
> {
  // TODO pass DidResolver Class so the procted class is set correctly
  /**
   * Resolved a did.
   */
  protected didResolver!: Res;

  /**
   * Injects required services
   * @param gatewayBlockchainService
   * @param hashService
   * @param logger
   */
  constructor(
    protected readonly gatewayBlockchainService: GatewayBlockchainService,
    protected readonly transactionCheckService: TransactionCheck<Res>,
    protected readonly cachedService: CachedService<Res>,
    protected readonly walletService: WalletClientService,
    protected readonly logger: Logger,
    protected readonly configService: ConfigService,
  ) {}

  /**
   * Adds a transaction. Returns a promise if it succeeded.
   * @param transaction
   * @param type
   */
  async addTransaction(
    transaction: TransactionDto,
    type?: 'own',
  ): Promise<PersistedTransaction> {
    // checks if the transaction was imported by one of the named identifier
    const clientImports: string[] =
      this.configService.getString('IMPORT')?.split(' ') ?? [];
    const imported = clientImports.includes(
      transaction.signature.values[0].identifier.split('#')[0],
    );
    if (imported) {
      transaction = await this.importedTransaction(transaction);
    }

    //checks if signer is authorized, DidIds have a seperated check with self signed and hirarchie.
    if (transaction.body.type !== TransactionType.Did) {
      await this.transactionCheckService
        .canUpdatebyController(transaction)
        .catch((err) => {
          this.logger.error(err);
          throw new ConflictException('signer not authorized');
        });
    }

    return new Promise((resolve, reject) => {
      this.gatewayBlockchainService.addTransaction(transaction, type).then(
        (persisted) => {
          this.logger.debug({
            message: `parsed ${transaction.body.type}`,
            labels: { source: this.constructor.name },
          });
          resolve(persisted);
        },
        (err: Error) => {
          reject(err);
        },
      );
    });
  }

  /**
   * Adds a signature to the transaction to proof it was correct.
   */
  public async addDidDocSignature(transaction: TransactionDto) {
    const values = await this.cachedService.getTransactions(
      transaction.body.value.id,
    );
    const transactions = values
      .map((transaction) => transaction.values)
      .concat([transaction.body.value]);
    const did = await this.didResolver.load(transaction.body.value.id, {
      transactions,
      validateChainOfTrust: false,
    });
    // parse the transaction into the did
    // add signature
    const didDocSignature: SignatureInfo = {
      type: SignatureType.Single,
      values: [
        await this.walletService.signIssuer({
          document: did.getDocument(),
          version: did.getVersion(),
        }),
      ],
    };
    transaction.metadata.didDocSignature = didDocSignature;
  }

  /**
   * Adds the information that the transaction was imported from another blockchain.
   * @param transaction
   */
  async importedTransaction(
    transaction: TransactionDto,
  ): Promise<TransactionDto> {
    transaction.metadata.imported = {
      date: transaction.body.date,
      imported: {
        type: SignatureType.Single,
        values: [
          await this.walletService.signIssuer(
            this.cachedService.getValues(transaction),
          ),
        ],
      },
    };
    return transaction;
  }
}
