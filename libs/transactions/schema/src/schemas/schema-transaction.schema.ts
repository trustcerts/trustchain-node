import { ApiProperty } from '@nestjs/swagger';
import { DidIdDocument } from '@tc/did/schemas/did.schema';
import { DidTransaction } from '@apps/shared/did/schemas/did-transaction.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaStructure } from '../dto/schema.transaction.dto';
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
