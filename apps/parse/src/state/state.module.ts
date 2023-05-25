import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RootState, RootStateSchema } from './schema/root-state.schema';
import { STATE_CONNECTION } from './constants';
import { StateDbModule } from './state-db.module';
import { StateService } from './state.service';
@Module({
  imports: [
    StateDbModule,
    MongooseModule.forFeature(
      [{ name: RootState.name, schema: RootStateSchema }],
      STATE_CONNECTION,
    ),
  ],

  providers: [StateService],
  exports: [StateService],
})
export class StateModule {}
