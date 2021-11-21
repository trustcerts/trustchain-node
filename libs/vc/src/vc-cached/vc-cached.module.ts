import { Module } from '@nestjs/common';
import { VcDbModule } from '@tc/vc/vc-db/vc-db.module';

@Module({
  imports: [VcDbModule],
  providers: [],
  exports: [],
})
export class VcCachedModule {}
