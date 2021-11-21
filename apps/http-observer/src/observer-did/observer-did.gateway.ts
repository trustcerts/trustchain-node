import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { DidDocumentMetaData } from '@trustcerts/sdk';
import { DidTransaction } from '@tc/did/schemas/did-transaction.schema';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { VersionInformation } from '@tc/did/did-cached/VersionInformation';

// TODO validate incoming values.
/**
 * Values of a did request
 */
interface DidRequest {
  /**
   * unique identifier
   */
  identifier: string;
  /**
   * Information about the version
   */
  version: VersionInformation;
}

/**
 * Gateway to requests information via websocket
 */
@WebSocketGateway({ transports: ['websocket'] })
export class ObserverDidGateway {
  /**
   * Injects required services.
   * @param didCachedService
   */
  constructor(private readonly didCachedService: DidCachedService) {}

  /**
   * Endpoint to request values via websocket.
   * @param values
   * @returns
   */
  @SubscribeMessage('did')
  get(@MessageBody() values: DidRequest): Promise<DidTransaction[]> {
    return this.didCachedService.getTransactions(
      values.identifier,
      values.version,
    );
  }

  /**
   * Endpoint to request values via websocket.
   * @param values
   * @returns
   */
  @SubscribeMessage('did-metadata')
  getMetaData(@MessageBody() values: DidRequest): Promise<DidDocumentMetaData> {
    return this.didCachedService.getDocumentMetaData(
      values.identifier,
      values.version,
    );
  }
}
