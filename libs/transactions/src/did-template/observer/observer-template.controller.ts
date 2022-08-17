import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidTemplateTransaction } from '@tc/transactions/did-template/schemas/did-template-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { TemplateCachedService } from '@tc/transactions/did-template/cached/template-cached.service';
import { TemplateDocResponse } from '@tc/transactions/did-template/dto/doc-response.dto';
import { TemplateVerifierService } from '@trustcerts/did-template';

/**
 * Controls template requests.
 */
@ApiTags('template')
@UseGuards(MaintenanceGuard)
@Controller('template')
export class ObserverTemplateController extends DidControllerMixin<
  TemplateDocResponse,
  DidTemplateTransaction,
  TemplateVerifierService
>({ doc: TemplateDocResponse, trans: DidTemplateTransaction }) {
  /**
   * Injects required services
   * @param observerTemplateService
   */
  constructor(
    protected readonly observerTemplateService: TemplateCachedService,
  ) {
    super(observerTemplateService);
  }
}
