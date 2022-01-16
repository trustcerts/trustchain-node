import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@tc/config/config.service';
import { Observable } from 'rxjs';
import { Request } from 'express';

/**
 * Guard to protect admin routes
 */
@Injectable()
export class NetworkGuard implements CanActivate {
  /**
   * Injects the config service to get access to the network secret
   * @param configService
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Compares network secret and value from the authorization header.
   * @param context
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    return `Bearer ${this.configService.getString('NETWORK_SECRET')}` === auth;
  }
}
