import { CachedService } from '@tc/transactions/transactions/cache.service';
import { DidTemplate, TemplateDocument } from '../schemas/did-template.schema';
import { DidTemplateResolver } from '@trustcerts/did-template';
import {
  DidTemplateTransaction,
  TemplateTransactionDocument,
} from '../schemas/did-template-transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { ParsingService } from '@tc/transactions/transactions/parsing.service';
import { TEMPLATE_CONNECTION } from '../constants';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Handles requests to get a cached template.
 */
@Injectable()
export class TemplateCachedService extends CachedService<DidTemplateResolver> {
  /**
   * Injects required dependencies.
   * @param didModel
   */
  constructor(
    @InjectModel(DidTemplateTransaction.name, TEMPLATE_CONNECTION)
    protected transactionModel: Model<TemplateTransactionDocument>,
    @InjectModel(DidTemplate.name, TEMPLATE_CONNECTION)
    protected didModel: Model<TemplateDocument>,
  ) {
    super(transactionModel, didModel);
    this.resolver = new DidTemplateResolver();
  }

  /**
   * Requests a template by id but throws an error if not found.
   * @param id
   * @returns
   */
  async getTemplateOrFail(id: string): Promise<DidTemplate> {
    const template = await this.getById<DidTemplate>(id);
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
