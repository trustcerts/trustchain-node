import { DidCachedModule } from '@tc/did/did-cached/did-cached.module';
import { HASH_CONNECTION } from '@tc/hash/constants';
import { Hash, HashSchema } from '@tc/hash/entities/hash.entity';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDbModule } from '@tc/hash/hash-db/hash-db.module';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    DidCachedModule,
    HashDbModule,
    MongooseModule.forFeature(
      [{ name: Hash.name, schema: HashSchema }],
      HASH_CONNECTION,
    ),
  ],
  providers: [HashCachedService],
  exports: [HashCachedService],
})
export class HashCachedModule {}
