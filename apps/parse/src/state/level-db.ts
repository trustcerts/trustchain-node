import { DB } from '@ethereumjs/trie';
import { Level } from 'level';

const ENCODING_OPTS = { keyEncoding: 'buffer', valueEncoding: 'buffer' };

export class LevelDB implements DB {
  constructor(public _leveldb: Level) {}

  async get(key: Buffer) {
    let value = null;
    try {
      value = await this._leveldb.get<Buffer, Buffer>(key, ENCODING_OPTS);
    } catch (error: any) {
      // TODO implement
      if (error.notFound) {
        // not found, returning null
      } else {
        throw error;
      }
    }
    return value;
  }

  async put(key: Buffer, val: Buffer) {
    await this._leveldb.put(key, val, ENCODING_OPTS);
  }

  async del(key: Buffer) {
    await this._leveldb.del(key, ENCODING_OPTS);
  }

  async batch(opStack: any) {
    await this._leveldb.batch(opStack, ENCODING_OPTS);
  }

  copy() {
    return new LevelDB(this._leveldb);
  }
}
