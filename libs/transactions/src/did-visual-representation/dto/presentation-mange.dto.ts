import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@tc/transactions/transactions/did/dto/did-manage.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Presentation } from './presentation.dto';
import { Type } from 'class-transformer';

/**
 * Implements the Mange for the presentations of a did document.
 */
export class PresentationMange extends DidManage<Presentation> {
  /**
   * List of presentations that should be added to the did document.
   */
  @ApiProperty({
    description:
      'List of presentations that should be added to the did document.',
    type: [Presentation],
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => Presentation)
  add?: Presentation[];
}
