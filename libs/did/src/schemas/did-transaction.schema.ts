import { ApiProperty } from '@nestjs/swagger';
import { BcEntity } from '@apps/shared/bc-entity.schema';
import { DidStructure } from '@tc/did/dto/did.transaction.dto';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { Type } from 'class-transformer';

export type DidTransactionDocument = DidTransaction & Document;

/**
 * Entity that describes how dids are stored in the database.
 */
@Schema()
export class DidTransaction extends BcEntity {
  // /**
  //  * Hash of the transaction is the index.
  //  */
  // // TODO set length to the hash length
  // @Prop()
  // index!: string;

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
  @ApiProperty({ description: 'Values of the transaction', type: DidStructure })
  @Type(() => DidStructure)
  values!: DidStructure;

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
export const DidTransactionSchema =
  SchemaFactory.createForClass(DidTransaction);
