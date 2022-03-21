import { Connection } from 'mongoose';
import { DID_ID_CONNECTION } from '@tc/did-id/constants';
import { HASH_CONNECTION } from '@tc/did-hash/constants';
import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

/**
 * Health service for the Observer.
 */
@Injectable()
export class ObserverHealthService {
  /**
   * Required checks to start the node.
   */
  public initChecks: any[];

  /**
   * Imports required services.
   * @param db
   * @param didConnection
   * @param hashConnection
   */
  constructor(
    protected readonly db: MongooseHealthIndicator,
    @InjectConnection(DID_ID_CONNECTION)
    protected readonly didConnection: Connection,
    @InjectConnection(HASH_CONNECTION)
    protected readonly hashConnection: Connection,
  ) {
    this.initChecks = [
      async () =>
        this.db.pingCheck('did_database', {
          timeout: 300,
          connection: this.didConnection,
        }),
      async () =>
        this.db.pingCheck('hash_database', {
          timeout: 300,
          connection: this.hashConnection,
        }),
    ];
  }
}
