import { CachedService } from '@tc/transactions/transactions/cache.service';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';

/**
 * Defines the required structure to handle different transaction types.
 */
export interface TransactionChecks {
  /**
   * Returns the hash of the transaction. Calculation is based on defined keys.
   * @param transaction
   */
  hash: (transaction: TransactionDto) => string;
  /**
   * Returns the required signatures of the transaction.
   * @param transaction
   */
  signature: (transaction: TransactionDto) => SignatureDto[];
  /**
   * Minimum amount of transaction that should be passed to the endpoint.
   */
  signatureAmount: () => number;

  /**
   * Returns the required checks that should be run against the transaction.
   */
  // checks: Array<(transaction: TransactionDto, addedTransactions: TransactionDto[]) => void>;

  validation: (
    transaction: TransactionDto,
    addedTransactions: Map<string, TransactionDto>,
  ) => Promise<void>;

  /**
   * Cache service instance to get relevant function calls
   */
  cachedService: CachedService;
}
