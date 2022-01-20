import { ApiProperty } from '@nestjs/swagger';
import { DidIdDocument } from '@tc/did-id/schemas/did-id.schema';
import { DidTransaction } from '@shared/did/schemas/did-transaction.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TemplateStructure } from '../dto/template.transaction.dto';
import { Type } from 'class-transformer';

export type TemplateTransactionDocument = TemplateTransaction & DidIdDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class TemplateTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: TemplateStructure,
  })
  @Type(() => TemplateStructure)
  values!: TemplateStructure;
}

/**
 * Did Transaction Schema
 */
export const TemplateTransactionSchema =
  SchemaFactory.createForClass(TemplateTransaction);
