import {
  ConflictException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DidCachedService } from '@tc/did/did-cached/did-cached.service';
import { DidRegister } from '@trustcerts/sdk';
import { InjectModel } from '@nestjs/mongoose';
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
    @InjectModel(InviteRequest.name)
    private inviteModel: Model<InviteRequestDocument>,
    private readonly didCachedService: DidCachedService,
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
  async createInvite(inviteDto: InviteRequest): Promise<InviteRequest> {
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
      id: inviteDto.id || DidRegister.create().id,
    });

    await invite.save();
    this.logger.info({
      message: `Added invite for ${invite.name}`,
      labels: { source: this.constructor.name },
    });
    return invite;
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
    const invite = await this.inviteModel.findOne({ secret, id });
    if (!invite) {
      throw new UnprocessableEntityException(
        'No invite code found for this identifier.',
      );
    }
    invite.secret = undefined;
    await invite.save();
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
