import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { HashTransactionDto } from '@tc/hash/dto/hash.transaction.dto';
import { RateLimitCachedService } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.service';
import { Request } from 'express';

/**
 * Guard that checks if the Client has reached in limit.
 */
@Injectable()
export class LimitGuard implements CanActivate {
  /**
   * Injects the config service to get access to the network secret
   * @param rateLimitService
   */
  constructor(
    @Inject('RateLimitCachedService')
    private readonly rateLimitService: RateLimitCachedService,
  ) {}

  /**
   * Checks if the recaptcha token is correct.
   * @param context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const transaction: HashTransactionDto = request.body;
    if (await this.rateLimitService.limitReached(transaction)) {
      throw new HttpException('limit reached', HttpStatus.TOO_MANY_REQUESTS);
    }
    return true;
  }
}
