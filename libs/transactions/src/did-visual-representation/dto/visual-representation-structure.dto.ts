import { ApiProperty } from '@nestjs/swagger';
import { DidStructure } from '@tc/transactions/transactions/did/dto/did-structure.dto';
import { IsString, Matches, ValidateNested } from 'class-validator';
import { PresentationMange } from './presentation-mange.dto';
import { Type } from 'class-transformer';
import { VISUALREPRESENTATION_NAME } from '../constants';
import { getDid } from '@shared/helpers';

/**
 * Describes the value of a visualrepresentation.
 */

export class DidVisualRepresentationStructure extends DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a visualrepresentation',
  })
  @Matches(getDid(VISUALREPRESENTATION_NAME))
  @IsString()
  id!: string;

  /**
   * Presentation that should be connected with the did.
   */
  @ApiProperty({
    type: PresentationMange,
    description: 'Presentation that should be connected with the did.',
  })
  @ValidateNested()
  @Type(() => PresentationMange)
  presentation?: PresentationMange;
}
