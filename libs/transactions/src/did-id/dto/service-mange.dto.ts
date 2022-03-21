import { ApiProperty } from '@nestjs/swagger';
import { DidManage } from '@tc/transactions/transactions/did/dto/did-manage.dto';
import { DidService } from './did-service.dto';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Implements the Mange for the services of a did document.
 */
export class ServiceMange extends DidManage<DidService> {
  /**
   * List of services that should be added to the did document.
   */
  @ApiProperty({
    description: 'List of services that should be added to the did document.',
  })
  @ValidateNested({ each: true })
  @IsArray()
  @Type(() => DidService)
  add?: DidService[];
}
