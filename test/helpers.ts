import { Block } from '@tc/blockchain/block/block.interface';
import { ClientRedis } from '@nestjs/microservices';
import {
  DidId,
  DidIdRegister,
  Identifier,
  SignatureContent,
  VerificationRelationshipType,
} from '@trustcerts/did';
import { DidIdCachedService } from '@tc/transactions/did-id/cached/did-id-cached.service';
import { DidIdTransactionDto } from '@tc/transactions/did-id/dto/did-id-transaction.dto';
import { HashService } from '@tc/blockchain/hash.service';
import { RedisClient } from '@nestjs/microservices/external/redis.interface';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { WalletClientService } from '@tc/clients/wallet-client';
import { exec } from 'child_process';
import http = require('http');
import express = require('express');
import { CompressionType } from '@tc/transactions/did-template/dto/compressiontype.dto';
import { HashDidTransactionDto } from '@tc/transactions/did-hash/dto/hash-transaction.dto';
import { MESSAGE_EVENT } from '@nestjs/microservices/constants';
import { ParseClientService } from '@tc/clients/parse-client/parse-client.service';
import { SchemaTransactionDto } from '@tc/transactions/did-schema/dto/schema.transaction.dto';
import { Server } from 'socket.io';
import { Subject } from 'rxjs';
import {
  TRANSACTION_CREATED,
  TRANSACTION_PARSED,
} from '@tc/clients/event-client/constants';
import { TemplateTransactionDto } from '@tc/transactions/did-template/dto/template.transaction.dto';
import { TransactionMetadata } from '@tc/blockchain/transaction/transaction-metadata';

/**
 * create block with given transactions.
 * @param transactions Transactions to create a block with
 * @param index index of the block
 *
 */
export function setBlock(transactions: TransactionDto[], index: number): Block {
  const block: Block = {
    index,
    transactions,
    previousHash: '1',
    timestamp: new Date(new Date().getTime() - 2000).toISOString(),
    proposer: { identifier: '11eE', signature: '231W' },
    signatures: [
      { identifier: 'test_identifier', signature: 'test_signature' },
    ],
    hash: `${Math.random}`,
    version: 0,
  };
  return block;
}

/**
 * generate a dummy transaction for testing purposes only
 * @param transactionType Type of a transaction
 * choose one of the following or it will return hash transaction by default
 * did:trust:tc:dev:hash:2309udslknsdlvkjnakldjv
 */
export function generateTestHashTransaction(id = '1'): HashDidTransactionDto {
  return {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Hash,
      value: {
        id,
        algorithm: 'SHA256',
      },
    },
  };
}

/**
 * Generates a did id test transaction
 */
export function generateTestDidIdTransaction(): DidIdTransactionDto {
  return {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Did,
      value: { id: `${Math.random()}` },
    },
  };
}

/**
 * Stop listening to a redis event
 * @param client Redis client
 * @param channel Channel name
 */
export function removeRedisSub(subClient: RedisClient, channel: string) {
  subClient.unsubscribe(channel);
  subClient.quit();
}

/**
 * Create a did for http modules
 * @param walletService to sign the identifier
 * @param didCachedService to get the values from transaction
 */
export async function createDidForTesting(
  walletService: WalletClientService,
  didCachedService: DidIdCachedService,
) {
  // create key for client
  Identifier.setNetwork('tc:test');
  const did: DidId = DidIdRegister.create();
  // wallet setId
  await walletService.setOwnInformation(did.id);
  const pair = await walletService.getPublicKey();
  // add key
  did.addKey(pair.id, pair.value);
  // add Authentication
  did.addVerificationRelationship(
    pair.id,
    VerificationRelationshipType.modification,
  );
  // add Assertion
  did.addVerificationRelationship(
    pair.id,
    VerificationRelationshipType.assertionMethod,
  );

  // create transaction
  // add transaction
  const didDocSignature: SignatureInfo = {
    type: SignatureType.Single,
    values: [await walletService.signIssuer(did.getDocument())],
  };
  const transaction: TransactionDto = new DidIdTransactionDto(
    did.getChanges(),
    didDocSignature,
  );
  // add signature
  transaction.signature = {
    type: SignatureType.Single,
    values: [
      await walletService.signIssuer(didCachedService.getValues(transaction)),
    ],
  };

  return { transaction, did };
}

/**
 * Create a did for http modules
 * @param transaction a transaction that needed to be signed
 * @param walletService wallet service to sign the transaction
 */
export async function signContent(
  transaction: TransactionDto,
  walletService: WalletClientService,
) {
  const content: SignatureContent = {
    date: transaction.body.date,
    type: transaction.body.type,
    value: transaction.body.value,
  };

  transaction.signature.values = [await walletService.signIssuer(content)];
}

/**
 * default values of a transaction to reuse them during testing.
 */
export const transactionProperties: {
  metadata: TransactionMetadata;
  version: number;
  signature: SignatureInfo;
} = {
  version: 1,
  metadata: {
    version: 1,
    imported: {
      date: new Date().toISOString(),
      imported: {
        type: SignatureType.Single,
        values: [],
      },
    },
    didDocSignature: {
      type: SignatureType.Single,
      values: [
        {
          identifier: `${Identifier.generate('id')}#key1`,
          signature: 'ddd',
        },
      ],
    },
  },
  signature: {
    type: SignatureType.Single,
    values: [
      {
        identifier: `${Identifier.generate('id')}#key1`,
        signature: 'ddd',
      },
    ],
  },
};

/**
 * Listen to a redis event
 * @param client Redis client
 * @param pattern Channel name
 * @param callback(data) callback with a data parameter
 */
export function addRedisSub(
  client: ClientRedis,
  channel: string,
  callback: (data: any) => void,
) {
  const subClient = client.createClient(new Subject<Error>());
  subClient.subscribe(channel);
  subClient.on(MESSAGE_EVENT, (pattern: string, value: any) => {
    if (channel === pattern) {
      console.log(
        '\x1b[32m%s\x1b[0m',
        `an event was recieved on channel ${pattern} successfully`,
      );
      callback(JSON.parse(value).data);
      removeRedisSub(subClient, TRANSACTION_CREATED);
    }
  });
}

/**
 * Redis Event Listener for TRANSACTION_CREATED channel mainly used in http tests
 * @param clientRedis to emit a message to the message broker
 * @param HashService to hash transaction
 */
export function addListenerToTransactionParsed(
  clientRedis: ClientRedis,
  hashService: HashService,
) {
  addRedisSub(clientRedis, TRANSACTION_CREATED, async (val: TransactionDto) => {
    const persistedTransaction = {
      transaction: {
        hash: await hashService.hashTransaction(val),
        persisted: new Date().toISOString(),
      },
      block: {
        id: 1,
        createdAt: new Date().toISOString(),
        validators: [],
      },
    };
    clientRedis.emit(TRANSACTION_PARSED, persistedTransaction);
  });
}

/**
 * create a Web-Socket server
 * @param port a port for the server
 */
export function createWSServer(port: number): Promise<Server> {
  const app = express();
  const server = http.createServer(app);
  const ioServer = new Server(server);
  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(
        '\x1b[32m%s\x1b[0m',
        `Server is listening on Port:${port} successfully`,
      );
      resolve(ioServer);
    });
  });
}

/**
 * close an opened Server
 * @param server a server to close
 */
export function closeServer(server: Server): void {
  server.close((err) =>
    err
      ? console.log(err)
      : console.log('\x1b[32m%s\x1b[0m', `Server is successfully closed`),
  );
}

/**
 * Starts the dependencies of a test.
 * @param services an array of services
 * @returns
 */
export function startDependencies(services: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose -f test/docker-compose.yml --env-file test/.env up -d ${services.join(
        ' ',
      )}`,
      (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      },
    );
  });
}

/**
 * stop and remove all dependencies and volumes of a test.
 */
export function stopAndRemoveAllDeps(): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(
      `docker-compose -f test/docker-compose.yml --env-file test/.env down -v`,
      (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      },
    );
  });
}

/**
 * Prints the logs of the dependent docker containers.
 */
export async function printDepsLogs(services: string[]): Promise<void> {
  const exludedServices = ['db'];
  services = services.filter((service) => !exludedServices.includes(service));
  await new Promise<void>((resolve) => {
    exec(
      `docker-compose -f test/docker-compose.yml --env-file test/.env ps`,
      (err, stdout) => {
        console.log(stdout);
        resolve();
      },
    );
  });
  for (const service of services) {
    const res = await new Promise((resolve, reject) => {
      exec(
        `docker-compose -f test/docker-compose.yml --env-file test/.env logs ${service}`,
        (err, stdout) => {
          if (err) {
            reject(err);
          }
          resolve(stdout);
        },
      );
    });
    console.log(res);
  }
}

/**
 * Creates a hash transaction parse and persist it
 * @param id transaction hash
 * @param walletClientService wallet client service
 * @param didCachedService did cached service
 * @param clientRedis redis client
 * @returns
 */
export async function createHash(
  hash: string,
  walletClientService: WalletClientService,
  didCachedService: DidIdCachedService,
  parseClientService: ParseClientService,
) {
  const didTransaction = await createDidForTesting(
    walletClientService,
    didCachedService,
  );
  const hashTransaction: HashDidTransactionDto = {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Hash,
      value: {
        controller: {
          add: [],
          remove: [],
        },
        algorithm: 'SHA256',
        id: hash,
      },
    },
  };
  await signContent(hashTransaction, walletClientService);
  // make block
  await parseClientService.parseBlock(
    setBlock([didTransaction.transaction], 1),
  );
  await parseClientService.parseBlock(setBlock([hashTransaction], 2));
  return {
    didTransaction,
    schemaTransaction: hashTransaction,
  };
}

/**
 * Creates a schema transaction parse and persist it
 * @param id transaction hash
 * @param walletClientService wallet client service
 * @param didCachedService did cached service
 * @param clientRedis redis client
 * @returns
 */
export async function createSchema(
  schema: string,
  walletClientService: WalletClientService,
  didCachedService: DidIdCachedService,
  parseClientService: ParseClientService,
) {
  const didTransaction = await createDidForTesting(
    walletClientService,
    didCachedService,
  );
  const schemaTransaction: SchemaTransactionDto = {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Schema,
      value: {
        controller: {
          add: [],
          remove: [],
        },
        schema,
        id: Identifier.generate('sch'),
      },
    },
  };
  await signContent(schemaTransaction, walletClientService);
  // make block
  await parseClientService.parseBlock(
    setBlock([didTransaction.transaction], 1),
  );
  await parseClientService.parseBlock(setBlock([schemaTransaction], 2));
  return {
    didTransaction,
    schemaTransaction,
  };
}

/**
 * Creates a template transaction parse and persist it
 * @param id transaction hash
 * @param walletClientService wallet client service
 * @param didCachedService did cached service
 * @param clientRedis redis client
 * @returns
 */
export async function createTemplate(
  template: string,
  schemaId: string,
  walletClientService: WalletClientService,
  didCachedService: DidIdCachedService,
  parseClientService: ParseClientService,
) {
  const didTransaction = await createDidForTesting(
    walletClientService,
    didCachedService,
  );
  const templateTransaction: TemplateTransactionDto = {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Template,
      value: {
        schemaId,
        id: Identifier.generate('tmp'),
        template,
        compression: {
          type: CompressionType.JSON,
        },
      },
    },
  };
  await signContent(templateTransaction, walletClientService);
  await parseClientService.parseBlock(
    setBlock([didTransaction.transaction], 1),
  );
  await parseClientService.parseBlock(setBlock([templateTransaction], 2));
  return {
    didTransaction,
    templateTransaction,
  };
}
