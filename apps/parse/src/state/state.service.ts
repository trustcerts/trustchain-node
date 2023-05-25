import { Block } from '@tc/blockchain/block/block.interface';
import { DidDocument } from '@tc/transactions/transactions/did/schemas/did.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Level } from 'level';
import { LevelDB } from './level-db';
import { Model } from 'mongoose';
import { RootState, RootStateDocument } from './schema/root-state.schema';
import { STATE_CONNECTION } from './constants';
import { Trie } from '@ethereumjs/trie';
import { base58Encode } from '@trustcerts/helpers';
import { getHash, sortKeys } from '@trustcerts/crypto';
@Injectable()
export class StateService {
  /**
   * Storage path of the level db
   */
  private storage = 'state';
  /**
   * Trie instance to handle the patricia trie
   */
  private trie: Trie;
  /**
   * database instance to persist the trie
   */
  private db: LevelDB;

  /**
   * Initialised the service to interact with the state
   * @param rootStateModel db connection for the root states
   */
  constructor(
    @InjectModel(RootState.name, STATE_CONNECTION)
    protected rootStateModel: Model<RootStateDocument>,
  ) {
    this.db = new LevelDB(new Level(this.storage));
    this.trie = new Trie({ db: this.db });
  }

  /**
   * Adds a new element to the tree. Calculates that hash of it and adds it to the trie.
   * Sets the hash of id as the key and the hash of the document in the leave
   * @param value
   */
  async addElement(value: DidDocument) {
    const didHash = await getHash(value.id);
    const docHash = await getHash(JSON.stringify(sortKeys(value)));
    await this.trie.put(Buffer.from(didHash), Buffer.from(docHash));
  }

  /**
   * Stores the state root information from the parsed block
   * @param block
   */
  async storeRootState(block: Block) {
    return;
    // if (!block.stateRootHash) throw new Error();
    // const exists = await this.trie.checkRoot(
    //   Buffer.from(base58Decode(block.stateRootHash)),
    // );
    // if (!exists)
    //   throw new Error(
    //     `root hash ${
    //       block.stateRootHash
    //     } is not known, latest is ${base58Encode(this.trie.root())}`,
    //   );
    // await new this.rootStateModel({
    //   signatures: block.stateSignatures,
    //   root: block.stateRootHash,
    //   timestamp: block.timestamp,
    // }).save();
  }

  /**
   * Gets the root state based on the given data
   * @param date
   * @returns
   */
  async getRootState(date: Date): Promise<RootState> {
    // TODO check if it must be sorted to get the correct one
    const result = await this.rootStateModel.findOne({ date: { $gte: date } });
    if (!result) throw new Error(`no state root for ${date.toString()}`);
    return result;
  }

  /**
   * Generate the proof based on the did and the root of the trie
   * @param value
   */
  async getProof(did: string, root: string) {
    const hash = await getHash(did);
    const trie = new Trie({ db: this.db, root: Buffer.from(root) });
    const proof = await trie.createProof(Buffer.from(hash));
    return proof.map((buffer) => base58Encode(buffer));
  }

  /**
   * Resets the trie by emptying the db instance for root state
   */
  public async reset() {
    await this.rootStateModel.deleteMany();
    // TODO reset the trie
    await this.db._leveldb.clear();
  }
}
/**
 * The trie includes the hashes of the did documents
 * New entries are added when a new did document should be added
 * Only the validators need to handle it to sign the state
 * Other nodes like gateways should be able to create the state to generate a proove from it
 * Open questions: what happens when the state gets updated and somebody is requesting an actual proof? Trie has to be locked during updates
 */
/**
 * Process:
 * - Validators are putting their changes into the trie
 * - when all transactions are passed they get the root trie and sign it
 * - tries will be shared inside the consensus. If it failes the elements will be deleted from the tree (maybe think about to generate a copy and just throw it away). If it succeeds the signatures of the state proof are added to the block
 * - open to discuss if the state proof should be added in the blocks or if should run in parallel. Advatage when using it in the conensus protocol it makes sure that all validators are dealing with the same content. Another approach would be to run it in parallel, the validators are producing signatures for their current state root and broadcast them with the network. Observers are able to collect them and there them when someone asks for a resource. This could be managed by a consensus which makes sure the same timestamp is used. Or each validator is using its' own timestamp. It does not really matter since each signature has to be validaed on its' own instead of just comparing it.
 */
