import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { Template } from '@tc/template/schemas/template.schema';
import { TemplateCachedService } from '@tc/template/template-cached/template-cached.service';

/**
 * Controls template requests.
 */
@ApiTags('template')
@UseGuards(MaintenanceGuard)
@Controller('template')
export class ObserverTemplateController {
  /**
   * Injects required services
   * @param observerTemplateService
   */
  constructor(
    private readonly observerTemplateService: TemplateCachedService,
  ) {}
  /**
   * Looks for an entry to the template. Returns a 404 if there was nothing found.
   * @param template
   */
  @Get(':id')
  @ApiOperation({ summary: 'Looks for an entry to the template.' })
  @ApiParam({ name: 'id', description: 'id of the template' })
  @ApiResponse({ status: 404, description: 'Nothing was found.' })
  async getTemplate(@Param('id') id: string): Promise<Template> {
    return this.observerTemplateService.getTemplateOrFail(id).catch((e) => {
      throw new Error(e);
    });
  }
}
