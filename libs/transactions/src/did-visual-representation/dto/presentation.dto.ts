import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { PresentationType } from './presentation-type.dto';
import { Prop } from '@nestjs/mongoose';

export class Presentation {
  /**
   * Unique identifier of the presentation, added as fragment
   */
  @ApiProperty({
    description: 'unique identifier of a presentation',
    example: 'presentation',
  })
  @IsString()
  @Prop({ length: 20 })
  id!: string;

  /**
   * Type of the presentation.
   */
  @ApiProperty({
    description: 'type of the presentation',
    example: PresentationType.pdf,
    enum: PresentationType,
    enumName: 'PresentationType',
  })
  @IsEnum(PresentationType)
  @Prop({ type: PresentationType })
  type!: PresentationType;

  /**
   * Value of the presentation
   */
  @ApiProperty({
    description: 'value of the presentation',
    example: '<h1>{{ hello }}</h1>',
  })
  @IsString()
  @Prop()
  value!: string;
}
