import { ApiProperty } from '@nestjs/swagger';
import { DidIdStructure } from '@tc/did-id/dto/did-id-structure.dto';
import { DidTransaction } from '@shared/did/schemas/did-transaction.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type DidTransactionDocument = DidIdTransaction & Document;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidIdTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: DidIdStructure,
  })
  @Type(() => DidIdStructure)
  values!: DidIdStructure;
}

/**
 * Did Transaction Schema
 */
export const DidTransactionSchema =
  SchemaFactory.createForClass(DidIdTransaction);
