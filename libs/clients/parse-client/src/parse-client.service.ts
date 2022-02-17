import { BLOCK_PARSE, PARSE_TCP_INJECTION } from './constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { ClientTCP } from '@nestjs/microservices';
import { Inject, Injectable } from '@nestjs/common';
import { Observable, timeout } from 'rxjs';

/**
 * Client to interact with the service that is responsible for the parse actions.
 */
@Injectable()
export class ParseClientService {
  /**
   * timeout in ms when to cancel the persist request.
   */
  private parseTimeout = 2000;

  /**
   * Inject required services.
   * @param clientTCP
   */
  constructor(
    @Inject(PARSE_TCP_INJECTION) private readonly clientTCP: ClientTCP,
  ) {}

  /**
   * Send a block that should be parsed.
   * @param block
   */
  parseBlock(block: Block): Observable<void> {
    return this.clientTCP
      .send(BLOCK_PARSE, block)
      .pipe(timeout(this.parseTimeout));
  }
}
