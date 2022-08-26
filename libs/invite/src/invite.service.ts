import { ConfigService } from '@tc/config';
import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidIdRegister } from '@trustcerts/did';
import { INVITE_CONNECTION } from './constants';
import { InjectModel } from '@nestjs/mongoose';
import { InviteNode } from './dto/invite-node.dto';
import {
  InviteRequest,
  InviteRequestDocument,
} from '@tc/invite/schemas/invite-request.schema';
import { Logger } from 'winston';
import { Model } from 'mongoose';
import { randomBytes } from 'crypto';

/**
 * Service that manages the invites.
 */
@Injectable()
export class InviteService {
  /**
   * Injects the required services and repositories.
   * @param inviteModel
   * @param didCachedService
   * @param logger
   */
  constructor(
    @InjectModel(InviteRequest.name, INVITE_CONNECTION)
    private inviteModel: Model<InviteRequestDocument>,
    private readonly didCachedService: DidIdCachedService,
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Creates a random secret.
   */
  private static createSecret(): string {
    return randomBytes(16).toString('hex');
  }

  /**
   * Creates an invite for the given identifier and saves it. If force is set, ignore the already existing certificate.
   * @param inviteDto
   */
  async createInvite(inviteDto: InviteRequest): Promise<InviteNode> {
    if (!inviteDto.force) {
      await this.inviteModel
        .findOne({ name: inviteDto.name })
        .then((res) =>
          res
            ? new ConflictException('identifier already has an invite code')
            : true,
        );
      if (inviteDto.id) {
        await this.didCachedService.getDidByKey(inviteDto.id).then(
          () => new ConflictException('identifier already exists'),
          () => true,
        );
      }
    }

    const invite = new this.inviteModel({
      name: inviteDto.name,
      role: inviteDto.role,
      secret: inviteDto.secret || InviteService.createSecret(),
      id: inviteDto.id || DidIdRegister.create().id,
    });

    await invite.save();
    this.logger.info({
      message: `Added invite for ${invite.name}`,
      labels: { source: this.constructor.name },
    });
    // TODO return a jwt so the elements are in one object and have not to be copies one by one
    return {
      id: invite.id,
      secret: invite.secret!,
      endpoint: `${this.configService.getString('OWN_PEER')}`,
    };
  }

  // TODO expose endpint
  /**
   * Returns all existing invites.
   */
  readInvites() {
    return this.inviteModel.find();
  }

  // TODO expose endpoint
  /**
   * Delete the secret to an invite so it cannot be used anymore.
   * @param id
   */
  async deactivateInvite(id: string) {
    await this.inviteModel.findOneAndUpdate({ id }, { secret: '' });
    this.logger.info({
      message: `Deactivate invite for ${id}`,
      labels: { source: this.constructor.name },
    });
  }

  /**
   * Returns true if the given identifier and secret have a matching entry in the database. Returns if the invite can be used for a read only key.
   * @param id
   * @param secret
   */
  async isValidInvite(id: string, secret: string): Promise<InviteRequest> {
    const query: any = { id, secret };
    const invite = await this.inviteModel.findOne(query);
    if (!invite) {
      throw new UnprocessableEntityException(
        'No invite code found for this identifier.',
      );
    }
    if (!this.configService.getBoolean('REUSE_INVITE')) {
      invite.secret = undefined;
      await invite.save();
    }
    return invite;
  }

  /**
   * Deletes all invites
   */
  public async clearTable() {
    await this.inviteModel.deleteMany({});
  }

  /**
   * Returns the name to a did from the invite database.
   * @param id
   */
  resolve(id: string) {
    return this.inviteModel
      .findOne({
        id,
      })
      .select(['-_id', 'name']);
  }
}
