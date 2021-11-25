import { ApiProperty } from '@nestjs/swagger';
import {
  IDENTIFIER_LENGTH_MAX,
  IDENTIFIER_LENGTH_MIN,
  SIGNATURE_LENGTH_MAX,
} from '@tc/p2-p/connect.const';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { Prop } from '@nestjs/mongoose';

/**
 * Represents a signature
 */
export class SignatureDto {
  /**
   * Identifier of the Validator. Required since validators generate certificate that includes multiple public keys with identifiers.
   */
  @ApiProperty({
    description: 'Identifier of the issuer and the used key',
    example: 'client1#key1',
  })
  @Prop()
  @IsString()
  @MaxLength(IDENTIFIER_LENGTH_MAX)
  @MinLength(IDENTIFIER_LENGTH_MIN)
  identifier!: string;

  /**
   * The actual signature as a string.
   */
  @ApiProperty({
    description: 'The actual signature as a hex encoded string.',
    example:
      '3a23def958efc4434a8ae70f8b683f51a4093e15c7e47bd9dbbbba44f3f91d6e9a9a862ee6cd2d82a6392a2962789bf71714a0461e598fe62426bd62d0691b58cdfacf14a80c925d60ebf5b662d92f10dfdc0eec527a39fd8b255eb9ccc37c454d0a5eddc27577f32b566f3e6fb2704f7734227326ba4eeef7c147fbe711a24684ddd208c4c92969b4c2d762fb9a3489bf02971a3bee1f7a761df7140a1a12718d03dbdb16b850f3cd489839e60a93c18b54be7187985864afb93da81bd8441ac77ecaa77caf9818328a86fc3d2ec81afc9f9f0f259bb4bdd551845bf568ea68029586e38bc860c60fbf322bc8d85a03af780fedeb73f356b3808e83b4a7f377',
  })
  @Prop()
  @IsString()
  @MaxLength(SIGNATURE_LENGTH_MAX)
  signature!: string;
}
