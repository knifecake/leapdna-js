import { Hashable } from "./utils";

export enum LeapdnaBlockType {
  Block = 'block',
  Sequence = 'sequence',
  Allele = 'allele',
  CEAllele = 'ce_allele',
  SequenceAllele = 'seq_allele',
  Locus = 'locus',
  Study = 'study'
}

export type LeapdnaBlockCommonParams = {
  id?: string,
  version?: string,
  type?: LeapdnaBlockType,
  leapdna?: object,
  user?: object
}

let block_no = 1;

export class Block implements Hashable {
  type = LeapdnaBlockType.Block;

  _id?: string;
  version: string;
  leapdna?: object;
  user?: object;
  _hashable_id: string;

  constructor({ id, version = "1", type, leapdna, user }: LeapdnaBlockCommonParams = {}) {
    if (type !== undefined && type !== this.type) {
      throw new Error(`Leapdna block is not a ${this.type}`);
    }

    if (id !== undefined) {
      this._id = id;
      this._hashable_id = id;
    } else {
      this._hashable_id = `block#${block_no++}`;
    }

    this.version = version;
    this.leapdna = leapdna;
    this.user = user;
  }

  to_leapdna(top_level: boolean = false): any {
    let ret: any = { type: this.type };
    if (this._id !== undefined) ret.id = this._id;
    if (this.user !== undefined) ret.user = this.user;
    if (top_level) {
      ret.version = this.version;
      ret.leapdna = this.leapdna;
    }
    return ret;
  }

  get id() {
    return this._hashable_id;
  }
}
