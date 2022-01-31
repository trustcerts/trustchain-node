import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@apps/shared/did/dto/did-manage.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * Implements the Mange for the authentication keys of a did document.
 */
export class VerificationRelationshipManage extends DidManage<string> {
  /**
   * Id that should be removed from the list.
   */
  @ApiProperty({
    description: 'id that should be removed from the list',
    example: ['element1'],
  })
  @IsOptional()
  @IsString({ each: true })
  add?: string[];
}
