import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from './did-manage.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * Manager class for the controllers.
 */
export class ControllerManage extends DidManage<string> {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'id that should be added to the controller list.',
    type: [String],
    required: false,
    example: ['did:example:12345'],
  })
  @IsOptional()
  @IsString({ each: true })
  add?: string[];

  /**
   * List of did that should be removed.
   */
  @ApiProperty({
    description: 'id that should be removed from the controller list.',
    type: [String],
    required: false,
    example: ['did:example:12345'],
  })
  @IsOptional()
  @IsString({ each: true })
  remove?: string[];
}
