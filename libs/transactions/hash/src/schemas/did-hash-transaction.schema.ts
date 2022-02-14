import { ApiProperty } from '@nestjs/swagger';
import {
  DidTransaction,
  DidTransactionDocument,
} from '@shared/did/schemas/did-transaction.schema';
import { HashStructure } from '../dto/hash-structure.dto';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';

export type HashTransactionDocument = DidHashTransaction &
  DidTransactionDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidHashTransaction extends DidTransaction {
  /**
   * DID Subject, only including the id of the document since method is defined by the system.
   * https://www.w3.org/TR/did-core/#did-subject
   */
  @IsString()
  @Prop({ length: 50, index: true })
  id!: string;

  /**
   * Timestamp when the element was created.
   */
  @Prop()
  @ApiProperty({ description: 'Timestamp when the element was created.' })
  createdAt!: string;

  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: HashStructure,
  })
  @Type(() => HashStructure)
  values!: HashStructure;
}

/**
 * Did Transaction Schema
 */
export const HashTransactionSchema =
  SchemaFactory.createForClass(DidHashTransaction);
