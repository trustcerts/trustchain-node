import {
  CanActivate,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@tc/config';
import { Observable } from 'rxjs';

/**
 * Guard to handle the maintenance mode. Will look defined routes because the database is rebuild and would return wrong results.
 */
@Injectable()
export class MaintenanceGuard implements CanActivate {
  /**
   * Imports the version service to check the current status.
   * @param configService
   */
  constructor(private readonly configService: ConfigService) {}

  /**
   * Checks if the maintenance mode is activated. If yes, throw an error with the status code for service unavailable.
   */
  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    if (this.configService.getConfig('MAINTENANCE')) {
      throw new ServiceUnavailableException(
        'Maintenance mode activated, try it later',
      );
    }
    return true;
  }
}
