import { ApiProperty } from '@nestjs/swagger';
import { BcEntity } from '@shared/transactions/bc-entity.schema';
import { DidTransactionDocument } from '@apps/shared/did/schemas/did-transaction.schema';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { TransactionHashValue } from '../dto/transaction-hash-value.dto';
import { Type } from 'class-transformer';

export type HashTransactionDocument = HashTransaction & DidTransactionDocument;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class HashTransaction extends BcEntity {
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
    type: TransactionHashValue,
  })
  @Type(() => TransactionHashValue)
  values!: TransactionHashValue;

  /**
   * Signature of the current did document.
   */
  @ApiProperty({ description: 'Signature of the hash.', type: [SignatureDto] })
  @Prop()
  @Type(() => SignatureDto)
  didDocumentSignature!: SignatureDto[];
}

/**
 * Did Transaction Schema
 */
export const HashTransactionSchema =
  SchemaFactory.createForClass(HashTransaction);
