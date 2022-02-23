import { HashCachedModule } from '@tc/hash/hash-cached/hash-cached.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RateLimitCachedService } from '@tc/security/rate-limit/rate-limit-cached/rate-limit-cached.service';
import { SECURITY_CONNECTION } from '@tc/security/constants';
import { Security, SecuritySchema } from '@tc/security/schemas/security.entity';
import { SecurityDbModule } from '@tc/security/security-db/security-db.module';

@Module({
  imports: [
    HashCachedModule,
    SecurityDbModule,
    MongooseModule.forFeature(
      [{ name: Security.name, schema: SecuritySchema }],
      SECURITY_CONNECTION,
    ),
  ],
  providers: [RateLimitCachedService],
  exports: [RateLimitCachedService],
})
export class RateLimitCachedModule {}
