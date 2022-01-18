import { ApiProperty } from '@nestjs/swagger';
import { DID_NAME } from '@tc/did/constants';
import { IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import {
  SignatureInfo,
  SignatureType,
  TransactionBody,
  TransactionDto,
} from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { Type } from 'class-transformer';
import { getDid } from '@shared/helpers';

/**
 * Defines the keys to change elements of did documents that include
 */
export class DidManage {
  /**
   * Includes rules to add a list of objects that will be appended.
   */
  add?: any[];

  /**
   * List of did that should be removed
   */
  remove?: string[];
}

/**
 * Manager class for the controllers.
 */
class ControllerManage extends DidManage {
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

/**
 * Body structure of a did transaction.
 */
export class DidStructure {
  /**
   * Unique identifier.
   */
  @ApiProperty({
    // TODO set correct example
    example: '123456789ABCDEFGHJKLMN',
    description: 'unique identifier of a did',
  })
  @Matches(getDid(DID_NAME))
  @IsString()
  id!: string;

  /**
   * Did that controls this did.
   */
  @ValidateNested()
  @Type(() => ControllerManage)
  controller?: ControllerManage;
}

/**
 * Body of a did transaction.
 */
export class DidTransactionBody extends TransactionBody {
  /**
   * Elements of the did document.
   */
  @Type(() => DidStructure)
  value!: DidStructure;

  /**
   * type of the transaction.
   */
  @ApiProperty({
    description: 'type of the transaction.',
    enum: TransactionType,
    enumName: 'TransactionType',
  })
  type!: TransactionType;

  /**
   * Signature of the did document after applying the changes.
   */
  @ApiProperty({
    description: 'signature of the did document after applying the changes',
  })
  @Type(() => SignatureInfo)
  didDocSignature!: SignatureInfo;
}

/**
 * Datatransferobject for did transactions.
 */
export class DidTransactionDto extends TransactionDto {
  /**
   * Inits the type and the signature values.
   * @param value
   */
  constructor(value: DidStructure, didDocSignature: SignatureInfo) {
    super(TransactionType.Did, value);
    this.body.didDocSignature = didDocSignature;
    this.signature = {
      type: SignatureType.single,
      values: [],
    };
  }

  /**
   * Body of the transaction. Defined by each transaction type.
   */
  @Type(() => DidTransactionBody)
  body!: DidTransactionBody;
}
