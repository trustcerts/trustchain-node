import { Injectable } from '@nestjs/common';
import { Level } from 'level';
import { LevelDB, Trie } from '@ethereumjs/trie';
import { getHash, sortKeys } from '@trustcerts/crypto';
@Injectable()
export class StateService {
  private storage = 'state';
  private trie: Trie;

  constructor() {
    this.trie = new Trie({ db: new LevelDB(new Level(this.storage)) });
  }

  /**
   * Adds a new element to the tree. Calculates that hash of it and adds it to the trie.
   * @param value
   */
  async addElement(value: any) {
    const hash = await getHash(JSON.stringify(sortKeys(value)));
    this.trie.put(Buffer.from(hash), Buffer.from(hash));
  }

  async getProof(value: any) {
    const hash = await getHash(JSON.stringify(sortKeys(value)));
    // const proof = await Trie.createProof(this.trie, Buffer.from(hash));
    // return {
    //   proof,
    //   root: this.trie.root.toString('base64'),
    //   signatures: [],
    // };
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
