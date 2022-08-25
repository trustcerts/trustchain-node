import { ApiProperty } from '@nestjs/swagger';
import { CompressionType } from './compression-type.dto';
import { IsEnum } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

/**
 * Information about  the used compression for the values
 */

export class Compression {
  /**
   * Name of the compression
   */
  @ApiProperty({
    description: 'type of the compression',
    enum: CompressionType,
    enumName: 'CompressionType',
    example: CompressionType.JSON,
  })
  @IsEnum(CompressionType)
  @Prop({ type: CompressionType })
  type!: CompressionType;

  /**
   * Json encoded information that are required for this kind of compression.
   */
  @ApiProperty({
    description:
      'Json encoded information that are required for this kind of compression.',
  })
  @Prop()
  value?: string;
}
