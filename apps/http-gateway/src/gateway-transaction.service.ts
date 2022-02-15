import { CachedService } from '@shared/cache.service';
import { ConfigService } from '@tc/config';
import { ConflictException } from '@nestjs/common';
import { DidResolver } from '@trustcerts/core';
import { GatewayBlockchainService } from './gateway-blockchain/gateway-blockchain.service';
import { Logger } from 'winston';
import { PersistedTransaction } from '@shared/http/dto/persisted-transaction';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { TransactionCheck } from '@shared/transactions/transaction.check';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { WalletClientService } from '@tc/wallet-client';

/**
 * Base Service to add a transaction.
 */
export class GatewayTransactionService {
  protected didResolver!: DidResolver;

  /**
   * Injects required services
   * @param gatewayBlockchainService
   * @param hashService
   * @param logger
   */
  constructor(
    protected readonly gatewayBlockchainService: GatewayBlockchainService,
    protected readonly transactionCheckService: TransactionCheck,
    protected readonly cachedService: CachedService,
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
    type?: string,
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

    //checks if signer is authorized
    await this.transactionCheckService.canUpdate(transaction).catch(() => {
      throw new ConflictException('signer not authorized');
    });

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
   * Adds the information that the transaction was imported from another blockchain.
   * @param transaction
   */
  async importedTransaction(
    transaction: TransactionDto,
  ): Promise<TransactionDto> {
    transaction.metadata.imported = {
      date: transaction.body.date,
      imported: {
        type: SignatureType.single,
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
