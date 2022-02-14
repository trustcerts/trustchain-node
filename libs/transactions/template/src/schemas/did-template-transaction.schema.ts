import { ApiProperty } from '@nestjs/swagger';
import {
  DidTransaction,
  DidTransactionDocument,
} from '@shared/did/schemas/did-transaction.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TemplateStructure } from '../dto/templatestructure.dto';
import { Type } from 'class-transformer';

export type TemplateTransactionDocument = DidTemplateTransaction &
  DidTransactionDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidTemplateTransaction extends DidTransaction {
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
export const TemplateTransactionSchema = SchemaFactory.createForClass(
  DidTemplateTransaction,
);