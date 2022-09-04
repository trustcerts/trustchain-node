import { ApiProperty } from '@nestjs/swagger';
import {
  DidTransaction,
  DidTransactionDocument,
} from '@tc/transactions/transactions/did/schemas/did-transaction.schema';
import { DidVisualRepresentationStructure } from '../dto/visual-representation-structure.dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type VisualRepresentationTransactionDocument =
  DidVisualRepresentationTransaction & DidTransactionDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidVisualRepresentationTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: DidVisualRepresentationStructure,
  })
  @Type(() => DidVisualRepresentationStructure)
  values!: DidVisualRepresentationStructure;
}

/**
 * Did Transaction Schema
 */
export const VisualRepresentationTransactionSchema =
  SchemaFactory.createForClass(DidVisualRepresentationTransaction);
