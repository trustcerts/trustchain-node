import { Socket as ClientSocket } from 'socket.io-client';
import { HttpService } from '@nestjs/axios';
import { Logger } from 'winston';
import { RoleManageType } from '@tc/transactions/did-id/constants';
import { Socket as ServerSocket } from 'socket.io';
import { lastValueFrom } from 'rxjs';
import { wait } from './helpers';

/**
 * Interface to represent a connection between two nodes.
 */
export class Connection {
  /**
   * Stores if the connection is secure
   * @private
   */
  private secure!: boolean;

  /**
   * WS Connection
   */
  public socket!: ClientSocket | ServerSocket;

  /**
   * Saves if the connection is a Client socket or a server socket.
   */
  public connectionType!: 'Client' | 'Server';

  /**
   * url of the connection.
   */
  public peer!: string;

  /**
   * identifier of the connection.
   */
  public identifier!: string;

  /**
   * Type of the connection
   */
  public type!: RoleManageType;

  /**
   * Injects required services.
   * @param logger
   * @param httpService
   */
  constructor(
    private readonly logger: Logger,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Returns the http endpoint. will return https if the connection is secure.
   */
  async getHttpEndpoint(): Promise<string> {
    // remove protocol when it was added.
    this.peer = this.peer.replace(/(^\w+:|^)\/\//, '');
    if (this.secure === undefined) {
      this.secure = await this.isSecure();
    }
    return `http${this.secure ? 's' : ''}://${this.peer}`;
  }

  /**
   * Returns the web socket endpoint based on the http endpoint.
   */
  async getWsEndpoint(): Promise<string> {
    return this.getHttpEndpoint().then((endpoint) => {
      return endpoint.replace('http', 'ws');
    });
  }

  /**
   * Checks if the endpoint is secure. Calls itself if the connection was reset before tls evaluation to repeat the request.
   * @private
   */
  private async isSecure(): Promise<boolean> {
    return lastValueFrom(
      this.httpService.get(`https://${this.peer}/health/init`),
    ).then(
      () => {
        return true;
      },
      async (err: any) => {
        if (err.code === 'ECONNRESET') {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return this.isSecure();
        } else {
          return false;
        }
      },
    );
  }

  /**
   * Checks if the node is healthy. will retry again and again but with a bigger time period.
   */
  async waitUntilHealthy(maxRetry = 10) {
    let ready = false;
    const url = await this.getHttpEndpoint();
    //TODO reset this when the reset event is triggered to avoid side effects.
    for (let retry = 0; retry < maxRetry; retry++) {
      await lastValueFrom(this.httpService.get(`${url}/health/init`)).then(
        () => {
          this.logger.debug({
            message: `${this.peer} seems to be available`,
            labels: { source: this.constructor.name },
          });
          ready = true;
        },
        (e) => {
          this.logger.warn({
            message: `failed to connect to ${url}: ${e.toString()}`,
            labels: { source: this.constructor.name },
          });
        },
      );
      if (!ready) {
        this.logger.warn({
          message: `${this.peer} is not healthy yet, wait ${retry} seconds`,
          labels: { source: this.constructor.name },
        });
        await wait(retry * 1000);
      } else {
        return;
      }
    }
    throw new Error(`${this.peer} seems to be offline`);
  }

  /**
   * Closes the ws connection.
   */
  disconnect() {
    if (this.connectionType === 'Client') {
      (this.socket as ClientSocket).disconnect();
    } else {
      (this.socket as ServerSocket).disconnect(true);
    }
  }

  /**
   * Removes all listeners on a specific event.
   * @param event
   */
  removeAllListeners(event: string, listener?: any) {
    if (this.connectionType === 'Client') {
      (this.socket as ClientSocket).off(event, listener);
    } else {
      if (listener) {
        (this.socket as ServerSocket).removeListener(event, listener);
      } else {
        (this.socket as ServerSocket).removeAllListeners(event);
      }
    }
  }
}
