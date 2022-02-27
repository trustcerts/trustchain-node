import { BcEntity } from '@shared/transactions/bc-entity.schema';
import { DidId } from '@tc/did-id/schemas/did-id.schema';
import { IsString } from 'class-validator';
import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema } from '@nestjs/mongoose';

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
export class Did extends BcEntity {
  /**
   * DID Subject, only including the id of the document since method is defined by the system.
   * https://www.w3.org/TR/did-core/#did-subject
   */
  @IsString()
  @Prop({ index: true, length: 64, unique: true })
  id!: string;

  /**
   * Context of a did document
   */
  // @Prop()
  // @IsArray()
  // @IsString()
  // '@context'!: string[];

  /**
   * Controllers are authorized to make changes to the document.
   * https://www.w3.org/TR/did-core/#control
   */
  @Prop({
    type: [{ type: MongooseSchema.Types.ObjectId, ref: 'DidId' }],
    default: [],
  })
  controllers!: DidId[];
}
