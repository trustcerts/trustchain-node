import { DidHash } from '@tc/transactions/did-hash/schemas/did-hash.schema';
import { HashCachedService } from '@tc/transactions/did-hash/cached/hash-cached.service';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { NotFoundException } from '@nestjs/common';
import { TrackingService } from '@apps/http-observer/src/tracking/tracking.service';

/**
 * WS endpoint to handle hash requests.
 */
@WebSocketGateway({ transports: ['websocket'] })
export class ObserverHashGateway {
  /**
   * Injects required dependencies.
   * @param hashService
   * @param trackingService
   */
  constructor(
    private readonly hashService: HashCachedService,
    private readonly trackingService: TrackingService,
  ) {}

  /**
   * Looks for an entry to the hash. Returns a 404 if there was nothing found.
   * @param hash
   */
  @SubscribeMessage('hash')
  async getHash(@MessageBody() hash: string): Promise<DidHash> {
    const entry = await this.hashService.getHash(hash);
    if (!entry) {
      throw new NotFoundException();
    }
    // TODO add origin
    await this.trackingService.save(entry, '');
    return entry;
  }
}
