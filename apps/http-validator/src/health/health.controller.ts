import { ConfigService } from '@tc/config';
import { Connection } from '@apps/shared/connection';
import { Controller, Get } from '@nestjs/common';
import { DID_CONNECTION } from '@tc/did/constants';
import {
  HealthCheck,
  HealthCheckService,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { HealthIndicatorFunction } from '@nestjs/terminus/dist/health-indicator';
import { INVITE_CONNECTION } from '@tc/invite/constants';
import { InjectConnection } from '@nestjs/mongoose';
import {
  NETWORK_PORT_TCP,
  NETWORK_URL,
} from 'libs/clients/network-client/src/constants';
import {
  PERSIST_PORT_TCP,
  PERSIST_URL,
} from 'libs/clients/persist-client/src/constants';
import { Transport } from '@nestjs/microservices';
import {
  WALLET_PORT_TCP,
  WALLET_URL,
} from 'libs/clients/wallet-client/src/constants';

/**
 * Health check endpoint for this service and the node.
 */
@Controller('health')
export class HealthController {
  private readonly dbChecks: HealthIndicatorFunction[];
  private readonly microChecks: HealthIndicatorFunction[];

  /**
   * Import required dependencies.
   * @param configService
   * @param healthCheckService
   * @param microserviceHealthIndicator
   * @param db
   * @param didConnection
   * @param inviteConnection
   */
  constructor(
    private readonly configService: ConfigService,
    private healthCheckService: HealthCheckService,
    private readonly microserviceHealthIndicator: MicroserviceHealthIndicator,
    protected readonly db: MongooseHealthIndicator,
    @InjectConnection(DID_CONNECTION)
    protected readonly didConnection: Connection,
    @InjectConnection(INVITE_CONNECTION)
    protected readonly inviteConnection: Connection,
  ) {
    // TODO checks should be filled when the modules are imported. So the health service has to be added to hash-db so it can add the ping check for the database
    this.dbChecks = [
      async () =>
        this.db.pingCheck('did_database', {
          timeout: 300,
          connection: this.didConnection,
        }),
      async () =>
        this.db.pingCheck('invite_database', {
          timeout: 300,
          connection: this.inviteConnection,
        }),
    ];

    // TODO ping if others are there. use isHealthy call from the clientmodules. Also let the Client modules add themself to the array.
    this.microChecks = [
      async () =>
        this.microserviceHealthIndicator.pingCheck('wallet_microservice', {
          timeout: 300,
          transport: Transport.TCP,
          options: {
            host: this.configService.getString(WALLET_URL),
            port: this.configService.getNumber(WALLET_PORT_TCP),
          },
        }),
      async () =>
        this.microserviceHealthIndicator.pingCheck('persist_microservice', {
          timeout: 300,
          transport: Transport.TCP,
          options: {
            host: this.configService.getString(PERSIST_URL),
            port: this.configService.getNumber(PERSIST_PORT_TCP),
          },
        }),
      async () =>
        this.microserviceHealthIndicator.pingCheck('network_microservice', {
          timeout: 300,
          transport: Transport.TCP,
          options: {
            host: this.configService.getString(NETWORK_URL),
            port: this.configService.getNumber(NETWORK_PORT_TCP),
          },
        }),
    ];
  }

  /**
   * Define endpoint
   */
  @Get()
  @HealthCheck()
  all() {
    // TODO define
    return this.healthCheckService.check([
      ...this.dbChecks,
      ...this.microChecks,
    ]);
  }

  /**
   * Endpoint for checks when the node is ready.
   */
  @Get('init')
  @HealthCheck()
  init() {
    // TODO define
    return this.healthCheckService.check([
      ...this.dbChecks,
      ...this.microChecks,
    ]);
  }
}
