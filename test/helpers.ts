import {
  BLOCK_CREATED,
  BLOCK_PARSED,
  TRANSACTION_CREATED,
  TRANSACTION_PARSED,
} from '@tc/event-client/constants';
import { Block } from '@tc/blockchain/block/block.interface';
import { ClientRedis } from '@nestjs/microservices';
import {
  DidId,
  Identifier,
  SignatureContent,
  VerificationRelationshipType,
} from '@trustcerts/core';
import { DidIdCachedService } from '@tc/did-id/did-id-cached/did-id-cached.service';
import { DidIdTransactionDto } from '@tc/did-id/dto/did-id.transaction.dto';
import { HashCreationTransactionDto } from '@tc/hash/dto/hash-creation.transaction.dto';
import { HashService } from '@tc/blockchain/hash.service';
import { MESSAGE_EVENT } from '@nestjs/microservices/constants';
import { RedisClient } from '@nestjs/microservices/external/redis.interface';
import { SignatureInfo } from '@tc/blockchain/transaction/signature-info';
import { SignatureType } from '@tc/blockchain/transaction/signature-type';
import { Subject } from 'rxjs';
import { TransactionDto } from '@tc/blockchain/transaction/transaction.dto';
import { TransactionType } from '@tc/blockchain/transaction/transaction-type';
import { WalletClientService } from '@tc/wallet-client';
import { exec } from 'child_process';
import http = require('http');
import express = require('express');
import { CompressionType } from '@tc/template/dto/template.transaction.dto';
import { DidIdRegister } from '@trustcerts/did-id-create';
import { Server } from 'socket.io';

/**
 * at least one array should be given
 *
 */
interface oneOrMoreArray<T> extends Array<T> {
  /**
   * included elements
   */
  0: T;
}

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
 * Emit block and return true if block got parsed
 * @param block Block to be presist and parsed
 * @param clientRedis Redis client
 * @param direct boolean without waiting for redis signals
 */
export function sendBlock(
  block: Block,
  clientRedis: ClientRedis,
  direct = false,
): Promise<boolean> {
  if (direct) {
    return new Promise((resolve) => {
      clientRedis.emit(BLOCK_CREATED, block);
      setTimeout(() => {
        resolve(true);
      }, 1500);
    });
  } else {
    return new Promise((resolve, reject) => {
      // if in 3 seconds we get no response the function will return false
      const rejectIfFail = setTimeout(() => {
        reject(false);
      }, 3000);
      addRedisSub(clientRedis, BLOCK_PARSED, (value: number) => {
        if (value === block.index) {
          clearTimeout(rejectIfFail);
          resolve(true);
        } else {
          reject(false);
        }
      });
      clientRedis.emit(BLOCK_CREATED, block);
    });
  }
}

/**
 * generate a dummy transaction for testing purposes only
 * @param transactionType Type of a transaction
 * choose one of the following or it will return hash transaction by default
 * 'did' , 'hash'
 */
export function generateTestTransaction(transactionType: string) {
  const metaData = {
    version: 1,
    metadata: {
      version: 1,
    },
    signature: {
      type: SignatureType.single,
      values: [{ identifier: 'test_id', signature: 'test_signature' }],
    },
  };
  const hashTransaction: HashCreationTransactionDto = {
    ...metaData,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.HashCreation,
      value: {
        hash: `${Math.random()}`,
        algorithm: 'TestA',
      },
    },
  };

  const didTransaction: DidIdTransactionDto = {
    ...metaData,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Did,
      value: { id: `${Math.random()}` },
      didDocSignature: {
        type: SignatureType.single,
        values: [{ identifier: 'test_id', signature: 'test_signature' }],
      },
    },
  };

  if (transactionType === 'did') return didTransaction;
  else return hashTransaction;
}

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
      removeRedisSub(subClient, BLOCK_PARSED);
    }
  });
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
    type: SignatureType.single,
    values: [await walletService.signIssuer(did.getDocument())],
  };
  const transaction: TransactionDto = new DidIdTransactionDto(
    did.getChanges(),
    didDocSignature,
  );
  // add signature
  transaction.signature = {
    type: SignatureType.single,
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
 * Shared transaction Properties for testing purposes
 */
export const transactionProperties = {
  version: 1,
  metadata: {
    version: 1,
    imported: {
      date: new Date().toISOString(),
      imported: {
        type: SignatureType.single,
        values: [],
      },
    },
  },
  signature: { type: SignatureType.single, values: [] },
};

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
export function startDependencies(
  services: oneOrMoreArray<string>,
): Promise<void> {
  const renameServices = services.map((service) => `testing_${service}_1`);
  return new Promise((resolve, reject) => {
    exec(
      `docker start ${renameServices.toString().replaceAll(',', ' ')}`,
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
 * Stops the dependencies of a test.
 * @param services an array of services
 * @returns
 */
export function stopDependencies(
  services: oneOrMoreArray<string>,
): Promise<void> {
  const renameServices = services.map((service) => `testing_${service}_1`);
  return new Promise((resolve, reject) => {
    exec(
      `docker stop ${renameServices.toString().replaceAll(',', ' ')}`,
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
 * Creates a template transaction parse and persist it
 * @param hash transaction hash
 * @param walletClientService wallet client service
 * @param didCachedService did cached service
 * @param clientRedis redis client
 * @returns
 */
export async function createTemplate(
  hash: string,
  walletClientService: WalletClientService,
  didCachedService: DidIdCachedService,
  clientRedis: ClientRedis,
) {
  const didTransaction = await createDidForTesting(
    walletClientService,
    didCachedService,
  );
  const hashCreation = {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.HashCreation,
      value: {
        hash,
        algorithm: 'sha256',
      },
    },
  };
  await signContent(hashCreation, walletClientService);

  const templateTransaction = {
    ...transactionProperties,
    body: {
      version: 1,
      date: new Date().toISOString(),
      type: TransactionType.Template,
      value: {
        schema: 'test',
        id: Identifier.generate('tmp'),
        template: 'string',
        compression: {
          type: CompressionType.JSON,
          value: 'string',
        },
      },
    },
  };
  await signContent(templateTransaction, walletClientService);
  // make block
  const block: Block = setBlock(
    [didTransaction.transaction, templateTransaction, hashCreation],
    1,
  );
  // send block via redis
  await sendBlock(block, clientRedis, true);
  return {
    didTransaction,
    templateTransaction,
  };
}
