import { ApiProperty } from '@nestjs/swagger';
import { BcEntity } from '@tc/transactions/transactions/bc-entity.schema';
import { DidStructure } from '../dto/did-structure.dto';
import { Document } from 'mongoose';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { Type } from 'class-transformer';

export type DidTransactionDocument = DidTransaction & Document;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidTransaction extends BcEntity {
  /**
   * DID SubjNect, only including the id of the document since method is defined by the system.
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
   * Type of the transaction.
   */
  @Prop()
  @ApiProperty({ description: 'Type of the transaction' })
  type!: string;

  /**
   * Includes the changes of a did document as json object.
   */
  @Prop()
  @ApiProperty({
    description: 'Values of the transaction',
    type: DidStructure,
  })
  @Type(() => DidStructure)
  values!: DidStructure;

  /**
   * Signature of the current did document.
   */
  @ApiProperty({ description: 'Signature of the hash.', type: SignatureInfo })
  @Prop()
  @Type(() => SignatureInfo)
  didDocumentSignature!: SignatureInfo;
}

/**
 * Did Transaction Schema
 */
export const DidTransactionSchema =
  SchemaFactory.createForClass(DidTransaction);
