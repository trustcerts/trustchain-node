import { IDENTIFIER_LENGTH_MAX } from '@tc/p2-p/connect.const';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TrackingDocument = Tracking & Document;

/**
 * DTO that describes an tracking of a hash.
 */
@Schema({ timestamps: true })
export class Tracking {
  /**
   * Hash of the hash.
   */
  @IsString()
  @Prop({ length: 64 })
  hash!: string;

  /**
   * Issuer of the hash.
   */
  @IsString()
  @Prop({ length: IDENTIFIER_LENGTH_MAX, required: false })
  issuer?: string;

  /**
   * store origin
   */
  @IsString()
  @Prop()
  origin!: string;
}

/**
 * Tracking Schema
 */
export const TrackingSchema = SchemaFactory.createForClass(Tracking);
