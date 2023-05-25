import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidStatusListTransaction } from '@tc/transactions/did-status-list/schemas/did-status-list-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { StatusListCachedService } from '@tc/transactions/did-status-list/cached/status-list-cached.service';
import { StatusListDocResponse } from '@tc/transactions/did-status-list/dto/status-list-doc-response.dto';
import { StatusListVerifierService } from '@trustcerts/did-status-list';

/**
 * Controls statuslist requests.
 */
@ApiTags('statuslist')
@UseGuards(MaintenanceGuard)
@Controller('statuslist')
export class ObserverStatusListController extends DidControllerMixin<
  StatusListDocResponse,
  DidStatusListTransaction,
  StatusListVerifierService
>({ doc: StatusListDocResponse, trans: DidStatusListTransaction }) {
  /**
   * Injects required services
   * @param observerStatusListService
   */
  constructor(
    protected readonly observerStatusListService: StatusListCachedService,
  ) {
    super(observerStatusListService);
  }
}
