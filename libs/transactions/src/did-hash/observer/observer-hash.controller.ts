import { ApiTags } from '@nestjs/swagger';
import { Controller, UseGuards } from '@nestjs/common';
import { DidControllerMixin } from '@tc/transactions/transactions/did/did.controller';
import { DidHashTransaction } from '@tc/transactions/did-hash/schemas/did-hash-transaction.schema';
import { HashCachedService } from '@tc/transactions/did-hash/cached/hash-cached.service';
import { HashDocResponse } from '@tc/transactions/did-hash/dto/hash-doc-response.dto';
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
