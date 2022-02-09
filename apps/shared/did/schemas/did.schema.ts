import { BcEntity } from '@shared/transactions/bc-entity.schema';
import { DidId } from '@tc/did-id/schemas/did-id.schema';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { IsString } from 'class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/**
 * Did as a Document.
 */
export type DidDocument = Did & Document;

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
@Schema()
export class Did extends BcEntity {
  /**
   * DID Subject, only including the id of the document since method is defined by the system.
   * https://www.w3.org/TR/did-core/#did-subject
   */
  @IsString()
  @Prop({ index: true, length: 64, unique: true })
  id!: string;

  /**
   * Controllers are authorized to make changes to the document.
   * https://www.w3.org/TR/did-core/#control
   */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'DidId' }],
  })
  controllers!: DidId[];
}

/**
 * Did Schema
 */
export const DidSchema = SchemaFactory.createForClass(Did);
