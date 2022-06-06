import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Inject,
  OnApplicationBootstrap,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DidRoles } from '@tc/transactions/did-id/dto/did-roles.dto';
import { EventPattern, Transport } from '@nestjs/microservices';
import { LIST_NOT_EMPTY } from '@tc/blockchain/blockchain.events';
import { Logger } from 'winston';
import { NetworkGuard } from '@shared/guards/network-guard.service';
import { NetworkValidatorService } from './network-validator.service';
import { P2PService } from '@tc/p2-p';
import {
  SYSTEM_RESET,
  TRANSACTION_CREATED,
} from '@tc/clients/event-client/constants';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { ValidatorBlockchainService } from './validator-blockchain/validator-blockchain.service';
import { ValidatorConsensusService } from './validator-blockchain/validator-consensus/validator-consensus.service';

/**
 * Endpoint to interact with the network service of the Validator.
 */
@Controller()
export class NetworkValidatorController implements OnApplicationBootstrap {
  /**
   * Imports required services.
   * @param validatorBlockchainService
   * @param networkValidatorService
   * @param p2PService
   * @param validatorConsensusService
   * @param client
   * @param logger
   */
  constructor(
    private readonly validatorBlockchainService: ValidatorBlockchainService,
    private readonly networkValidatorService: NetworkValidatorService,
    private readonly p2PService: P2PService,
    private readonly validatorConsensusService: ValidatorConsensusService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Called once the application has fully started and is bootstrapped.
   */
  async onApplicationBootstrap() {
    this.p2PService.checkOwnAvailability().then(() => this.p2PService.init());
  }

  /**
   * Returns the type of the node and the service that was exposed
   */
  @ApiOperation({
    summary: 'Returns the type of the node and the service that was exposed.',
  })
  @ApiResponse({
    status: 200,
    description: 'Type of node and service as script.',
  })
  @Get()
  public information() {
    return {
      serviceType: 'network',
      nodeType: DidRoles.Validator,
    };
  }

  /**
   * Listens to new transactions from the http service.
   * @param transaction
   */
  @EventPattern(TRANSACTION_CREATED, Transport.REDIS)
  newTransaction(transaction: TransactionDto) {
    this.validatorBlockchainService.broadCastTransaction(transaction).then();
  }

  /**
   * Resets the service.
   */
  @EventPattern(SYSTEM_RESET, Transport.REDIS)
  reset() {
    this.logger.info({
      message: 'reset service',
      labels: { source: this.constructor.name },
    });
    this.p2PService.closeAll();
    this.p2PService.reset = true;
    this.validatorConsensusService.resetService();
    this.validatorBlockchainService.transactionEvent.removeAllListeners(
      LIST_NOT_EMPTY,
    );
    this.validatorBlockchainService.transactionPool.clear();
  }

  /**
   * Returns true if the node has the required amount of connections.
   */
  @ApiBearerAuth()
  @UseGuards(NetworkGuard)
  @Get('mashed')
  @ApiOperation({
    summary:
      'Checks if the node has the required amount of Validator connections.',
  })
  @ApiResponse({
    status: 200,
    description:
      'No return value is passed. The positive status code is enough',
  })
  async mashed(@Query('amount') amount: number) {
    return this.networkValidatorService.isMashed(Number(amount));
  }
}
