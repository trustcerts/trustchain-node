import { EventEmitter } from 'events';
import { Injectable } from '@nestjs/common';

/**
 * Shared service so parsing events can be shared around a node.
 */
@Injectable()
export class ParsingService {
  /**
   * Emitter that is responsible for sharing events about transactions or blocks.
   */
  public emitter = new EventEmitter();
}
