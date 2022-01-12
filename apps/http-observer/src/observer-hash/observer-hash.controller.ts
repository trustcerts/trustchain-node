import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Hash } from '@tc/hash/schemas/hash.schema';
import { HashCachedService } from '@tc/hash/hash-cached/hash-cached.service';
import { MaintenanceGuard } from '@tc/config/version/maintenance.guard';
import { Request } from 'express';
import { TrackingService } from '../tracking/tracking.service';

/**
 * Endpoint to check hashes.
 */
@ApiTags('hash')
@UseGuards(MaintenanceGuard)
@Controller('hash')
export class ObserverHashController {
  constructor(
    private readonly hashService: HashCachedService,
    private readonly trackingService: TrackingService,
  ) {}

  /**
   * Looks for an entry to the hash. Returns a 404 if there was nothing found.
   * @param hash
   */
  @Get(':hash')
  @ApiOperation({ summary: 'Looks for an entry to the hash.' })
  @ApiParam({ name: 'hash', description: 'value of the hash' })
  @ApiResponse({ status: 404, description: 'Nothing was found.' })
  async getHash(
    @Param('hash') hash: string,
    @Req() req: Request,
  ): Promise<Hash> {
    const entry = await this.hashService.getHash(hash);
    if (!entry) {
      this.trackingService.saveTry(hash, req.get('origin')!);
      throw new NotFoundException();
    }
    await this.trackingService.save(entry, req.get('origin')!);
    return entry;
  }
}
