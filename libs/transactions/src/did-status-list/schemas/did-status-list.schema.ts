import * as mongoose from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Did } from '@tc/transactions/transactions/did/schemas/did.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusPurpose } from '../dto/status-purpose.dto';

export type StatusListDocument = DidStatusList & mongoose.Document;

/**
 * Describes the values of a statuslist that is used for revocation.
 */
@Schema()
export class DidStatusList extends Did {
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
export const StatusListSchema = SchemaFactory.createForClass(DidStatusList);
