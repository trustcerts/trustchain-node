import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@apps/shared/did/did.controller';
import { DidHashTransaction } from '@tc/hash/schemas/did-hash-transaction.schema';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { HashDocResponse } from '@tc/hash/dto/hash-doc-response.dto';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';

/**
 * Endpoint to check hashes.
 */
@ApiTags('hash')
@UseGuards(MaintenanceGuard)
@Controller('hash')
export class ObserverHashController extends DidControllerMixin<
  HashDocResponse,
  DidHashTransaction
>({ doc: HashDocResponse, trans: DidHashTransaction }) {
  constructor(protected readonly hashCachedService: HashCachedService) {
    super(hashCachedService);
  }
}
