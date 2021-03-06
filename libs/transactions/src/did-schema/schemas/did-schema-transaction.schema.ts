import { ApiProperty } from '@nestjs/swagger';
import { DidSchemaStructure } from '../dto/did-schema-structure.dto';
import { DidTransaction } from '@tc/transactions/transactions/did/schemas/did-transaction.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type SchemaTransactionDocument = DidSchemaTransaction & Document;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidSchemaTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: DidSchemaStructure,
  })
  @Type(() => DidSchemaStructure)
  values!: DidSchemaStructure;
}

/**
 * Did Transaction Schema
 */
export const SchemaTransactionSchema =
  SchemaFactory.createForClass(DidSchemaTransaction);
