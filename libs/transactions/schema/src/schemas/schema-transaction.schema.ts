import { ApiProperty } from '@nestjs/swagger';
import { DidIdDocument } from '@tc/did-id/schemas/did-id.schema';
import { DidTransaction } from '@shared/did/schemas/did-transaction.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaStructure } from '../dto/schema-structure.dto';
import { Type } from 'class-transformer';

export type SchemaTransactionDocument = SchemaTransaction & DidIdDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class SchemaTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: SchemaStructure,
  })
  @Type(() => SchemaStructure)
  values!: SchemaStructure;
}

/**
 * Did Transaction Schema
 */
export const SchemaTransactionSchema =
  SchemaFactory.createForClass(SchemaTransaction);
