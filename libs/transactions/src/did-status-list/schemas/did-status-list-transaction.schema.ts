import { ApiProperty } from '@nestjs/swagger';
import { DidStatusListStructure } from '../dto/did-status-list-structure.dto';
import {
  DidTransaction,
  DidTransactionDocument,
} from '@tc/transactions/transactions/did/schemas/did-transaction.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type StatusListTransactionDocument = DidStatusListTransaction &
  DidTransactionDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidStatusListTransaction extends DidTransaction {
  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: DidStatusListStructure,
  })
  @Type(() => DidStatusListStructure)
  values!: DidStatusListStructure;
}

/**
 * Did Transaction Schema
 */
export const StatusListTransactionSchema = SchemaFactory.createForClass(
  DidStatusListTransaction,
);
