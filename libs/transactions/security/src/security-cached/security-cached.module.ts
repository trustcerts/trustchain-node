import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SECURITY_CONNECTION } from '../constants';
import { Security, SecuritySchema } from '@tc/security/schemas/security.entity';
import { SecurityCachedService } from '@tc/security/security-cached/security-cached.service';
import { SecurityDbModule } from '@tc/security/security-db/security-db.module';

@Module({
  imports: [
    SecurityDbModule,
    MongooseModule.forFeature(
      [{ name: Security.name, schema: SecuritySchema }],
      SECURITY_CONNECTION,
    ),
  ],
  providers: [SecurityCachedService],
  exports: [SecurityCachedService],
})
export class SecurityCachedModule {}
