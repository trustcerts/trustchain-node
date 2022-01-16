import { Block } from '@tc/blockchain/block/block.interface';
import { BlockCheckService } from '@tc/blockchain/block-check/block-check.service';
import {
  CONSENSUS_READY_REQUEST,
  CONSENSUS_READY_RESPONSE,
  LIST_NOT_EMPTY,
  WS_BLOCK_COMMIT,
  WS_BLOCK_PERSIST,
  WS_BLOCK_PROPOSE,
} from '@tc/blockchain/blockchain.events';
import { ConfigService } from '@tc/config';
import { Connection } from '@shared/connection';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { ParticipantConsensus } from '../participant-consensus';
import { ProposedBlock } from '@tc/blockchain/block/proposed-block.dto';
import { ProposedSignatures } from '@tc/blockchain/block/proposed-signatures.dto';
import { SignatureService } from '@tc/blockchain/signature/signature.service';
import { ValidatorBlockchainService } from '../../validator-blockchain.service';
import { WalletClientService } from '@tc/wallet-client';
import { clearTimeout } from 'timers';
import { plainToClass } from 'class-transformer';
import { validateOrReject } from 'class-validator';

/**
 * Service to handle interaction with a proposer.
 */
@Injectable()
export class ValidatorService extends ParticipantConsensus {
  /**
   * Fired when the proposed block was not received in time.
   */
  private blockTimeout!: NodeJS.Timeout;

  /**
   * Fired when the signatures were not received in time.
   */
  private signatureTimeout!: NodeJS.Timeout;

  /**
   * Cancel block creation because all signatures are already there.
   */
  private cancel!: boolean;

  /**
   * active proposer connection.
   */
  private proposer!: Connection;

  /**
   * Time when the Validator starts to listen to the proposed block.
   */
  private waitBlockStart!: number;

  /**
   * Time when the Validator listens to the signatures for the proposed block.
   */
  private waitSignatureStart!: number;

  /**
   * Injects required services.
   * @param logger
   * @param blockCheckService
   * @param walletService
   * @param validatorBlockchainService
   * @param signatureService
   * @param configService
   */
  constructor(
    @Inject('winston') protected readonly logger: Logger,
    private readonly blockCheckService: BlockCheckService,
    private readonly walletService: WalletClientService,
    protected readonly validatorBlockchainService: ValidatorBlockchainService,
    private readonly signatureService: SignatureService,
    protected readonly configService: ConfigService,
  ) {
    super(logger, configService, validatorBlockchainService);
  }

  /**
   * Inits the service with the given proposer connection proposer
   * @param proposer
   */
  init(proposer: Connection, roundnumber: number): void {
    this.roundNumber = roundnumber;
    this.cancel = false;
    this.ready = true;
    // remove current listeners if the proposer needs to be updated.
    if (this.proposer) {
      this.proposer.removeAllListeners(WS_BLOCK_PROPOSE);
    }
    this.proposer = proposer;
    this.logTime('startDelay', this.startDelay);
    this.proposer.socket.on(
      WS_BLOCK_PROPOSE,
      (proposedBlock: ProposedBlock) => {
        this.proposedListener(proposedBlock);
        this.proposer.removeAllListeners(WS_BLOCK_PROPOSE);
      },
    );

    this.proposer.socket.on(CONSENSUS_READY_REQUEST, () => {
      this.proposer.socket.emit(CONSENSUS_READY_RESPONSE, this.ready);
    });

    this.validatorBlockchainService.transactionEvent.on(LIST_NOT_EMPTY, () => {
      // fired when list get more entries
      this.waitForBlock();
      this.validatorBlockchainService.transactionEvent.removeAllListeners(
        LIST_NOT_EMPTY,
      );
    });
    if (this.validatorBlockchainService.transactionPool.size > 0) {
      // fired when list is not empty right now
      this.waitForBlock();
    }
  }

  /**
   * Add timeout to cancel the wait process for a new block.
   */
  private waitForBlock() {
    this.waitBlockStart = new Date().getTime();
    if (this.running) {
      this.logger.debug({
        message: 'already running',
        labels: { source: this.constructor.name },
      });
      return;
    }
    this.running = true;
    this.validatorBlockchainService.transactionEvent.removeAllListeners(
      LIST_NOT_EMPTY,
    );
    this.logger.debug({
      message: `round ${this.roundNumber}: ${this.proposer.identifier}: transactions in pool, wait for new proposed block.`,
      labels: { source: this.constructor.name },
    });
    this.blockTimeout = setTimeout(() => {
      this.logger.warn({
        message: `round ${this.roundNumber}: ${this.proposer.identifier}: Proposer needed too long to send block. Start new round.`,
        labels: { source: this.constructor.name },
      });
      this.proposer.removeAllListeners(WS_BLOCK_PROPOSE);
      this.proposer.removeAllListeners(CONSENSUS_READY_REQUEST);
      this.newRound('prop needed to long');
    }, this.timeoutProposeBlock);
  }

  /**
   * Fired when the proposer needed to long to send the signatures to persist the block.
   */
  private waitForSignatures() {
    this.waitSignatureStart = new Date().getTime();
    this.signatureTimeout = setTimeout(() => {
      this.logger.warn({
        message: `round ${this.roundNumber}: ${this.proposer.identifier}: needed too long to send block to persist. Start new round`,
        labels: { source: this.constructor.name },
      });
      // removed the persist listener from the beginning of this function.
      this.proposer.removeAllListeners(WS_BLOCK_PERSIST);
      if (!this.cancel) {
        this.newRound('signatures too slow');
      }
    }, this.timeoutPersistBlock);
  }

  /**
   * Listener for a proposed block.
   * @param proposedBlock
   */
  private proposedListener(proposedBlock: ProposedBlock) {
    clearTimeout(this.blockTimeout);
    this.ready = false;
    this.proposer.removeAllListeners(CONSENSUS_READY_REQUEST);
    // Add persist listener, in case the validation needs too long and the block to persist arrives before the commit. Can happen, if other nodes
    // validate the block faster and the proposer broadcasts the signatures.
    this.proposer.socket.on(
      WS_BLOCK_PERSIST,
      (signatures: ProposedSignatures) => {
        this.persistListener(signatures);
        this.proposer.removeAllListeners(WS_BLOCK_PERSIST);
      },
    );
    this.logTime('waitForBlock', new Date().getTime() - this.waitBlockStart);
    this.logTime('waitForBlockTimeout', this.timeoutProposeBlock);

    this.logger.debug({
      message: `round ${this.roundNumber}: ${this.proposer.identifier}: got a new block, validate it`,
      labels: { source: this.constructor.name },
    });
    const start = new Date().getTime();
    this.isBlockValid(proposedBlock).then(
      async () => {
        this.block = proposedBlock;
        this.logTime('validationTime', new Date().getTime() - start);
        this.logTime('blockIndex', proposedBlock.index);
        this.logTime(
          'blockTransactionCounter',
          proposedBlock.transactions.length,
        );

        // stop signature process, proposer already sent signatures that should be added to the block.
        if (this.cancel) {
          return;
        }
        const signature = await this.walletService.signIssuer(proposedBlock);
        this.logger.debug({
          message: `round ${this.roundNumber}: ${this.proposer.identifier}: block was valid, send signature to commit it`,
          labels: { source: this.constructor.name },
        });

        this.proposer.socket.emit(WS_BLOCK_COMMIT, signature);
        this.waitForSignatures();
      },
      (err: Error) => {
        this.logger.error({
          message: `round ${this.roundNumber}: ${err.message!}`,
          labels: { source: this.constructor.name },
        });
        this.blockNotValid();
      },
    );
  }

  /**
   * Listener for signature to persist the block.
   * @param signatures
   */
  private persistListener(signatures: ProposedSignatures) {
    this.logTime(
      'waitForSignature',
      new Date().getTime() - this.waitSignatureStart,
    );
    this.logger.info({
      message: `round ${this.roundNumber}: ${this.proposer.identifier}: got signatures for persisting, validate them`,
      labels: { source: this.constructor.name },
    });
    clearTimeout(this.signatureTimeout);
    this.cancel = true;
    this.persistIfValid(signatures);
  }

  /**
   * Validates the proposed block. Returns true if the block is valid to sign.
   * @param block
   */
  private async isBlockValid(block: ProposedBlock): Promise<void> {
    await validateOrReject(plainToClass(ProposedBlock, block)).catch(
      (errors) => {
        this.logger.error({
          message: `round ${this.roundNumber}: ${JSON.stringify(block)}`,
          labels: { source: this.constructor.name, rejected: true },
        });
        Promise.reject(Error(JSON.stringify(errors)));
      },
    );
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(Error('Timeout, validation took too long.'));
      }, this.timeoutSignatureResponse);
      this.blockCheckService.checkProposedBlock(block).then(
        () => {
          resolve();
        },
        (err) => {
          this.logger.error({
            message: `round ${this.roundNumber}: ${JSON.stringify(block)}`,
            labels: { source: this.constructor.name, rejected: true },
          });
          reject(err);
        },
      );
    });
  }

  /**
   * Runs when the block was not valid.
   */
  private blockNotValid() {
    // TODO will not be deleted when block is invaid. therefore two rounds will be started.
    // solution: clear listener correctly. (prefferec)
    // solution2: make sure new round can only be called once.
    this.proposer.removeAllListeners(WS_BLOCK_PERSIST);
    this.logger.warn({
      message: `round ${this.roundNumber}: ${this.proposer.identifier}: block is not valid, start new round`,
      labels: { source: this.constructor.name },
    });

    if (!this.cancel) {
      this.setTimeout(
        'blockNotValid',
        setTimeout(() => {
          this.clearTimeout('blockNotValid');
          this.newRound('block not valid');
        }, this.timeoutPersistBlock),
      );
    }
  }

  /**
   * Persists the block if it's valid.
   * @param signatures
   */
  private persistIfValid(signatures: ProposedSignatures) {
    const block: Block = { ...this.block, ...signatures };
    this.signatureService.validateSignatures(block).then(
      () => {
        this.logger.debug({
          message: `round ${this.roundNumber}: persist block`,
          labels: { source: this.constructor.name },
        });
        const start = new Date().getTime();
        this.validatorBlockchainService.addBlock(block).then(() => {
          this.logTime('persistingTime', new Date().getTime() - start);
          this.logger.info({
            message: `round ${this.roundNumber}: parsed block ${block.index} successfully.`,
            labels: { source: this.constructor.name },
          });
          this.newRound(this.normalFinish);
        });
      },
      () => {
        this.logger.warn({
          message: `round ${this.roundNumber}: Invalid block cannot be persisted. Start new round.`,
          labels: { source: this.constructor.name },
        });
        this.newRound('Signatures of block were invalid, reject him');
      },
    );
  }
}
