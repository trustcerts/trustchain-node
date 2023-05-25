import { ApiProperty } from '@nestjs/swagger';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusPurpose } from '../dto/status-purpose.dto';

export type StatusListDocumentDocument = DidStatusListDocument & Document;

/**
 * Describes the values of a statuslist that is used for revocation.
 */
@Schema()
export class DidStatusListDocument extends DidDocument {
  /**
   * Encoded bitstring
   */
  @Prop()
  @ApiProperty({ description: 'enocded bitstring' })
  encodedList!: string;

  /**
   * purpose of the list
   */
  @Prop({ type: String, enum: StatusPurpose })
  @ApiProperty({ description: 'purpose of the list' })
  statusPurpose!: StatusPurpose;
}

/**
 * StatusList Schema
 */
export const StatusListSchema = SchemaFactory.createForClass(
  DidStatusListDocument,
);
