import { CachedService } from '@shared/cache.service';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ParsingService } from '@shared/parsing.service';
import { Template, TemplateDocument } from '../schemas/template.schema';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Handles requests to get a cached template.
 */
@Injectable()
export class TemplateCachedService extends CachedService {
  /**
   * Injects required dependencies.
   * @param templateModel
   */
  constructor(
    @InjectModel(Template.name) private templateModel: Model<TemplateDocument>,
  ) {
    super();
  }

  /**
   * Requests a template by id.
   * @param id
   * @returns
   */
  async getTemplate(id: string) {
    return this.templateModel.findOne({ id });
  }

  /**
   * Requests a template by id but throws an error if not found.
   * @param id
   * @returns
   */
  async getTemplateOrFail(id: string): Promise<Template> {
    const template = await this.templateModel.findOne({ id });
    if (!template) {
      throw new NotFoundException('template not found');
    }
    // TODO refactor since adding a value directly will be igored since it is a mongodb object.
    const f = JSON.parse(JSON.stringify(template));
    f.template = this.getTemplateContent(id);
    return f;
  }

  /**
   * Returns the template html file from the shared storage.
   * @param id
   * @returns
   */
  getTemplateContent(id: string): string {
    const path = join(ParsingService.shared_storage, 'tmp', id);
    if (!existsSync(path)) {
      throw new NotFoundException('template not found');
    }
    return readFileSync(path, 'utf-8');
  }
}
