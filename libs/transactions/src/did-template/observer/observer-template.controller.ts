import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidTemplate } from '@tc/transactions/did-template/schemas/did-template.schema';
import { DidTemplateTransaction } from '@tc/transactions/did-template/schemas/did-template-transaction.schema';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { TemplateCachedService } from '@tc/transactions/did-template/cached/template-cached.service';
import { TemplateDocResponse } from '@tc/transactions/did-template/dto/doc-response.dto';

/**
 * Controls template requests.
 */
@ApiTags('template')
@UseGuards(MaintenanceGuard)
@Controller('template')
export class ObserverTemplateController extends DidControllerMixin<
  TemplateDocResponse,
  DidTemplateTransaction
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
  /**
   * Looks for an entry to the template. Returns a 404 if there was nothing found.
   * @param template
   */
  @Get(':id')
  @ApiOperation({ summary: 'Looks for an entry to the template.' })
  @ApiParam({ name: 'id', description: 'id of the template' })
  @ApiResponse({ status: 404, description: 'Nothing was found.' })
  async getTemplate(@Param('id') id: string): Promise<DidTemplate> {
    return this.observerTemplateService.getTemplateOrFail(id).catch((e) => {
      throw new Error(e);
    });
  }
}
