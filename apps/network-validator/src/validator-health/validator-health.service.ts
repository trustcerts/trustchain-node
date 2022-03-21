import { ConfigService } from '@tc/config';
import { Injectable } from '@nestjs/common';
import { MicroserviceHealthIndicator } from '@nestjs/terminus';
import {
  PERSIST_PORT_TCP,
  PERSIST_URL,
} from '@tc/clients/persist-client/constants';
import { Transport } from '@nestjs/microservices';

/**
 * Health service for the Validator.
 */
@Injectable()
export class ValidatorHealthService {
  /**
   * Required checks to start the node.
   */
  public initChecks: any[];
  /**
   * Checks that deal with the consensus.
   */
  // public consensusChecks: any[];
  /**
   * Checks that are required to interact with the network.
   */

  // public certChecks: any[];

  /**
   * Import required services.
   * @param micro
   * @param configService
   */
  constructor(
    private readonly micro: MicroserviceHealthIndicator,
    private readonly configService: ConfigService,
  ) {
    // protected readonly hashConnection: any, // @InjectConnection(HASH_CONNECTION) // protected readonly inviteConnection: any, // @InjectConnection('inviteConnection') // protected readonly pkiConnection: any, // @InjectConnection(PKI_CONNECTION) // protected readonly cert: CertHealthIndicator, // protected readonly db: TypeOrmHealthIndicator,
    this.initChecks = [
      async () =>
        this.micro.pingCheck('persist', {
          timeout: 300,
          transport: Transport.TCP,
          options: {
            host: this.configService.getString(PERSIST_URL),
            port: this.configService.getNumber(PERSIST_PORT_TCP),
          },
        }),
      // async () =>
      //   this.db.pingCheck('hash_database', {
      //     timeout: 300,
      //     connection: this.hashConnection,
      //   }),
      // async () =>
      //   this.db.pingCheck('invite_database', {
      //     timeout: 300,
      //     connection: this.inviteConnection,
      //   }),
    ];
    // this.consensusChecks = [async () => this.consensus.isHealthy('consensus')];
    // this.certChecks = [async () => this.cert.isHealthy('cert')];
  }
}
