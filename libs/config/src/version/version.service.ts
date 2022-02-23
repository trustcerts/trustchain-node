import { ConfigService } from '@tc/config/config.service';
import { Gauge } from 'prom-client';
import { Inject, Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Logger } from 'winston';
import { build, buildDate, version } from '@shared/build';

/**
 * Service to handle the update process.
 */
@Injectable()
export class VersionService {
  /**
   * Imports required services.
   * @param configService
   * @param logger
   * @param startedInfoGauge
   * @param versionGauge
   */
  constructor(
    private readonly configService: ConfigService,
    @Inject('winston') private readonly logger: Logger,
    @InjectMetric('startedInformation') private startedInfoGauge: Gauge<string>,
    @InjectMetric('version') private versionGauge: Gauge<string>,
  ) {
    this.setPromVersion();
    this.setStarted();
  }

  /**
   * Sets value that are required when the node starts.
   * @private
   */
  private setStarted() {
    this.startedInfoGauge.set(new Date().getTime());
  }

  /**
   * Sets the current used version to expose it via prometheus.
   * @private
   */
  private setPromVersion() {
    const parts = version.split('.');
    this.versionGauge.set(
      {
        version,
        build,
        major: parts[0] ?? '',
        minor: parts[1] ?? '',
        patch: parts[2] ?? '',
      },
      buildDate,
    );
  }

  /**
   * Returns the current node version.
   */
  get is() {
    return this.configService.getConfig('VERSION') || '1.0.0';
  }

  /**
   * Returns the version of the docker image.
   */
  get should() {
    return version;
  }

  /**
   * Handles update process depending on the status.
   */
  public check() {
    switch (this.compare()) {
      case 'major':
        this.logger.warn({
          message: `major update from ${this.is} to ${this.should}`,
          labels: { source: this.constructor.name },
        });
        break;
      case 'minor':
        this.logger.warn({
          message: `minor update from ${this.is} to ${this.should}`,
          labels: { source: this.constructor.name },
        });
        break;
      case 'patch':
        this.logger.warn({
          message: `patch update from ${this.is} to ${this.should}`,
          labels: { source: this.constructor.name },
        });
        break;
      default:
        this.logger.debug({
          message: `running latest version: ${this.is}`,
          labels: { source: this.constructor.name },
        });
    }
    this.setVersion();
  }

  /**
   * Compares is and should version. Based on the depth of the number the update has to handles in a different way.
   */
  private compare() {
    const isElements = this.is.split('.');
    const shouldElements = this.should.split('.');
    if (shouldElements[0] > isElements[0]) {
      return 'major';
    } else if (shouldElements[1] > isElements[0]) {
      return 'minor';
    } else if (shouldElements[2] > isElements[2]) {
      return 'patch';
    } else {
      return;
    }
  }

  /**
   * Saves the current version after the required functions where called. Use the version number from the package.json file.
   */
  private setVersion() {
    this.configService.setConfig('VERSION', this.should);
  }
}
