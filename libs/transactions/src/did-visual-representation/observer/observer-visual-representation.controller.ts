import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidVisualRepresentationTransaction } from '@tc/transactions/did-visual-representation/schemas/did-visual-representation-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { VisualRepresentationCachedService } from '@tc/transactions/did-visual-representation/cached/visual-representation-cached.service';
import { VisualRepresentationDocResponse } from '@tc/transactions/did-visual-representation/dto/visual-representation-doc-response.dto';

/**
 * Controls visualrepresentation requests.
 */
@ApiTags('visualRepresentation')
@UseGuards(MaintenanceGuard)
@Controller('visualrepresentation')
export class ObserverVisualRepresentationController extends DidControllerMixin<
  VisualRepresentationDocResponse,
  DidVisualRepresentationTransaction,
  any
>({
  doc: VisualRepresentationDocResponse,
  trans: DidVisualRepresentationTransaction,
}) {
  /**
   * Injects required services
   * @param observerVisualRepresentationService
   */
  constructor(
    protected readonly observerVisualRepresentationService: VisualRepresentationCachedService,
  ) {
    super(observerVisualRepresentationService);
  }
}
