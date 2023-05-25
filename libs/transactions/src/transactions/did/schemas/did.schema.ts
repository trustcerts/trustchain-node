import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

/**
 * Describes an entity in form of a did object that can be connected with different values.
 */
export class DidDocument {
  /**
   * DID Subject, only including the id of the document since method is defined by the system.
   * https://www.w3.org/TR/did-core/#did-subject
   */
  @ApiProperty({ description: 'unique identifier of a did.' })
  @IsString()
  @Prop({ index: true, length: 64, unique: true })
  id!: string;

  /**
   * Context of a did document
   */
  @ApiProperty({
    description: 'schemas that define the document.',
  })
  @Prop()
  @IsString({ each: true })
  '@context'!: string[];

  /**
   * Controllers are authorized to make changes to the document.
   * https://www.w3.org/TR/did-core/#control
   */
  @ApiProperty({ description: 'unique identifiers of the controller.' })
  @Prop({
    default: [],
  })
  @IsString({ each: true })
  controller!: string[];
}
