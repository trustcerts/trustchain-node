import * as Joi from 'joi';
import * as Transport from 'winston-transport';
import * as fs from 'fs';
import * as winston from 'winston';
import { EnvConfig } from './env-config.schema';
import { Inject } from '@nestjs/common';
// @ts-ignore
import * as LokiTransport from 'winston-loki';

/**
 * Service that handles the configuration of the node.
 */
export class ConfigService {
  /**
   * Environment configuration
   */
  private readonly envConfig: any;

  /**
   * Contains the current configuration.
   */
  private values: any;

  /**
   * Constructor to add a ConfigService...
   * @param service
   * @param schemaExtend
   * @param dynamicSchema
   */
  constructor(
    @Inject('SERVICE') private service: Joi.SchemaMap,
    @Inject('STATIC') private schemaExtend: Joi.SchemaMap,
    @Inject('DYNAMIC') private dynamicSchema: Joi.SchemaMap,
  ) {
    this.createFolder();
    const config = this.getEnvVars();
    this.envConfig = this.validateInput(config);
    this.loadConfig();
  }

  /**
   * Creates the tmp folder if it does not exists yet.
   */
  private createFolder() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  /**
   * Use a custom storage path if it was passed.
   */
  get storagePath() {
    // TODO needs better logic
    return process.env.STORAGE ?? '/app/storage';
  }

  /**
   * Ensures all needed variables are set, and returns the validated JavaScript object
   * including the applied default values.
   */
  public validateInput(envConfig: EnvConfig): EnvConfig {
    const envVarsSchema = Joi.object(this.getValidationSchema());
    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  /**
   * Get the validation schema for the environment.
   */
  public getValidationSchema(): Joi.SchemaMap {
    return {
      //MAIN PORTS
      TCP_URL: Joi.number().default('localhost'),
      TCP_PORT: Joi.number().default(27017),
      IDENTIFIER: Joi.string(),
      //LOKI
      LOKI_URL: Joi.string(),
      LOG_LEVEL: Joi.string()
        .valid('debug', 'info', 'warn', 'error')
        .default('info'),
      LOKI_LOG_LEVEL: Joi.string()
        .valid('debug', 'info', 'warn', 'error')
        .default('info'),
      LOKI_AUTH: Joi.string().default('loki:loki'),
      //REDIS
      REDIS_URL: Joi.string().default('redis'),
      REDIS_PORT: Joi.number().default(6379),
      //HTTP
      HTTP_URL: Joi.string().default('http'),
      HTTP_PORT_HTTP: Joi.number().default(3000),
      HTTP_PORT_TCP: Joi.number().default(3001),
      //PERSIST
      PERSIST_URL: Joi.string().default('persist'),
      PERSIST_PORT_HTTP: Joi.number().default(3000),
      PERSIST_PORT_TCP: Joi.number().default(3001),
      //PARSE
      PARSE_URL: Joi.string().default('parse'),
      PARSE_PORT_HTTP: Joi.number().default(3000),
      PARSE_PORT_TCP: Joi.number().default(3001),
      //WALLET
      WALLET_URL: Joi.string().default('wallet'),
      WALLET_PORT_HTTP: Joi.number().default(3000),
      WALLET_PORT_TCP: Joi.number().default(3001),
      //NETWORK
      NETWORK_URL: Joi.string().default('network'),
      NETWORK_PORT_HTTP: Joi.number().default(3000),
      NETWORK_PORT_TCP: Joi.number().default(3001),
      STORAGE: Joi.string().default('/app/storage'),
      ...this.schemaExtend,
    };
  }

  /**
   * Gets the string value of a given key from the envConfig.
   * @param key given key
   */
  getString(key: string): string {
    return this.envConfig[key];
  }

  /**
   * Gets the number value of a given key from the envConfig.
   * @param key given key
   */
  getNumber(key: string): number {
    return Number(this.envConfig[key]);
  }

  /**
   * Gets the boolean value of a given key from the envConfig.
   * @param key given key
   */
  getBoolean(key: string): boolean {
    return Boolean(this.envConfig[key]);
  }

  /**
   * Returns the value to a given key from the configuration.
   * @param key given key
   */
  public getConfig(key: string) {
    return this.values[key];
  }

  /**
   * Sets a given key and given value in the configuration.
   * @param key given key
   * @param value given value
   */
  public setConfig(key: string, value: any) {
    this.values[key] = value;
    this.saveConfig();
  }

  /**
   * Removes the value of the config.
   * @param key given key
   */
  public removeConfig(key: string) {
    this.values[key] = undefined;
    this.saveConfig();
  }

  /**
   * Gets the environment variables from the node.
   */
  private getEnvVars(): EnvConfig {
    const envVars: any = {};
    Object.keys(this.getValidationSchema()).forEach((key) => {
      if (process.env[key] !== undefined) {
        envVars[key] = process.env[key];
      }
    });
    return envVars;
  }

  /**
   * Save the current configuration by writing it to a file.
   */
  private saveConfig() {
    fs.writeFileSync(
      `${this.storagePath}/config.json`,
      JSON.stringify(this.values, null, 4),
    );
  }

  /**
   * Load a previously saved configuration file.
   */
  private loadConfig() {
    const file = `${this.storagePath}/config.json`;
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify({}));
    }
    const values = JSON.parse(fs.readFileSync(file, 'utf8'));
    // Snipped to remove null values from the array.
    if (values.VALIDATORS) {
      values.VALIDATORS = values.VALIDATORS.filter(
        (value: string) => value != null,
      );
      this.values = values;
      this.saveConfig();
    }
    const { error, value: validatedEnvConfig } = Joi.object(
      this.dynamicSchema,
    ).validate(values);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    this.values = validatedEnvConfig;
  }

  /**
   * Returns the transports for the logger.
   */
  public getLoggingTransports(): Transport[] {
    const transports = [];
    transports.push(
      new winston.transports.Console({
        level: this.getString('LOG_LEVEL'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ message, labels, timestamp }) => {
            return `${timestamp} -> (${
              labels ? labels.source : 'undefined'
            }) ${message}`;
          }),
          winston.format.colorize({
            all: true,
            colors: {
              debug: 'white',
              info: 'cyan',
              warn: 'yellow',
              error: 'red',
            },
          }),
        ),
      }),
    );
    if (this.getString('LOKI_URL')) {
      transports.push(
        new LokiTransport({
          level: this.getString('LOKI_LOG_LEVEL'),
          batching: true,
          host: this.getString('LOKI_URL'),
          basicAuth: this.getString('LOKI_AUTH'),
          labels: { node: this.getConfig('IDENTIFIER'), service: this.service },
          format: winston.format.combine(
            winston.format.printf(({ message }) => {
              return message;
            }),
            winston.format.colorize({
              all: true,
              colors: {
                debug: 'white',
                info: 'cyan',
                warn: 'yellow',
                error: 'red',
              },
            }),
          ),
        }),
      );
    }
    return transports;
  }

  /**
   * Loads the parameters to connect to the db based on the db type.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public db(module: string) {
    console.log(
      `mongodb://${this.getString('DB_USERNAME')}:${this.getString(
        'DB_PASSWORD',
      )}@${this.getString('DB_HOST')}:${this.getString(
        'DB_PORT',
      )}/${this.getString('DB_DATABASE')}?authSource=admin`,
    );
    return `mongodb://${this.getString('DB_USERNAME')}:${this.getString(
      'DB_PASSWORD',
    )}@${this.getString('DB_HOST')}:${this.getString(
      'DB_PORT',
    )}/${this.getString('DB_DATABASE')}?authSource=admin`;
  }
}
