import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SignatureDto } from '@tc/blockchain/transaction/signature.dto';
import { Type } from 'class-transformer';
export type RootStateDocument = RootState & Document;

@Schema({ _id: false })
export class RootState {
  @Prop({ unique: true })
  timestamp!: Date;

  @Prop()
  root!: string;

  @Prop()
  @Type(() => SignatureDto)
  signatures!: SignatureDto[];
}

export const RootStateSchema = SchemaFactory.createForClass(RootState);
