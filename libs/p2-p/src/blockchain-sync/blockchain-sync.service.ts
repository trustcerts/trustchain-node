import { Block } from '@tc/blockchain/block/block.interface';
import { Socket as ClientSocket } from 'socket.io-client';
import { ConfigService } from '@tc/config';
import { Connection } from '@shared/connection';
import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import { NetworkService } from '@tc/network';
import { PersistClientService } from 'libs/clients/persist-client/src';
import { Socket as ServerSocket } from 'socket.io';
import { WS_BLOCK_MISSING } from '@tc/blockchain/blockchain.events';

/**
 * Service to sync up the chain.
 */
@Injectable()
export class BlockchainSyncService {
  /**
   * Size of the array of blocks that will be requested each time.
   */
  private readonly chunkSize: number;

  /**
   * Loads the required services.
   * @param persistClientService
   * @param networkService
   * @param configService
   * @param logger
   */
  constructor(
    private readonly persistClientService: PersistClientService,
    private readonly networkService: NetworkService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    this.chunkSize = this.configService.getNumber('CHUNK_SIZE');
  }

  /**
   * Adds response for missing blocks.
   * @param client
   */
  response(client: ClientSocket | ServerSocket) {
    // send missing blocks
    client.on(
      WS_BLOCK_MISSING,
      (data: { start: number; size: number }, callback) => {
        // TODO check chunk size against the local maximum for the risk of an overflow
        this.persistClientService
          .getBlocks(data.start, data.size)
          .then((blocks) => {
            callback(blocks);
          });
      },
    );
  }

  /**
   * Repeats to get missing chunks of blocks until no new blocks are sent so the chain is synced up.
   * @param endpoint
   */
  async request(endpoint: Connection): Promise<void> {
    this.logger.debug({
      message: 'request missing blocks',
      labels: {
        source: this.constructor.name,
        identifier: endpoint.identifier,
      },
    });
    let blocks = await this.getChunk(endpoint.socket);
    while (blocks.length > 0) {
      for (const block of blocks) {
        await this.networkService.addBlock(block);
      }
      blocks = await this.getChunk(endpoint.socket);
    }
    // got all blocks, give it some time to parse everything into the database.
    this.logger.debug({
      message: 'got all blocks',
      labels: {
        source: this.constructor.name,
        identifier: endpoint.identifier,
      },
    });
  }

  /**
   * requests a new chunk of blocks starting at a special point and having a maximum size.
   * @param client
   */
  private getChunk(client: ClientSocket | ServerSocket): Promise<Block[]> {
    return this.persistClientService.getBlockCounter().then((counter) => {
      return new Promise((resolve) => {
        client.emit(
          WS_BLOCK_MISSING,
          {
            start: counter + 1,
            size: this.chunkSize,
          },
          (blocks: Block[]) => resolve(blocks),
        );
      });
    });
  }
}
