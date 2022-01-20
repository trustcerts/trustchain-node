import { Connection } from 'mongoose';
import { DID_ID_CONNECTION } from '@tc/did-id/constants';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { INVITE_CONNECTION } from '@tc/invite/constants';
import { InjectConnection } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { MongooseHealthIndicator } from '@nestjs/terminus';

/**
 * Health service for the gateway.
 */
@Injectable()
export class GatewayHealthService {
  /**
   * Required checks to start the node.
   */
  public initChecks: any[];

  /**
   * Import required services.
   * @param db
   * @param didConnection
   * @param inviteConnection
   * @param hashConnection
   */
  constructor(
    protected readonly db: MongooseHealthIndicator,
    @InjectConnection(DID_ID_CONNECTION)
    protected readonly didConnection: Connection,
    @InjectConnection(INVITE_CONNECTION)
    protected readonly inviteConnection: Connection,
    @InjectConnection(HASH_CONNECTION)
    protected readonly hashConnection: Connection,
  ) {
    // TODO primary include checks for the internal node check. Maybe add another external check.
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
      async () =>
        this.db.pingCheck('invite_database', {
          timeout: 300,
          connection: this.inviteConnection,
        }),
    ];
  }
}
