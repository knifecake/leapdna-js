import { Block,  LeapdnaBlockCommonParams, LeapdnaBlockType } from './block';

import { Sequence } from './sequence';
import { Hashable } from './utils';

export type AlleleParams = {
  type?: LeapdnaBlockType,
  name?: string,
  count?: number,
  frequency?: number
} & LeapdnaBlockCommonParams;

export class Allele extends Block {
  type = LeapdnaBlockType.Allele;
  name?: string;
  frequency?: number;
  count?: number;

  constructor({ name, type, count, frequency, ...rest }: AlleleParams = {}) {
    super(rest);
    if (type !== undefined && type !=  LeapdnaBlockType.Allele) {
      throw new Error('Leapdna block is not an allele');
    }

    this.name = name;
    this.count = count;
    this.frequency = frequency;
  }

  to_leapdna(top_level = false) {
    let ret = super.to_leapdna(top_level);
    if (this.name !== undefined) ret.name = this.name;
    if (this.frequency !== undefined) ret.frequency = this.frequency;
    if (this.count !== undefined) ret.count = this.count;
    return ret;
  }

  get id() {
    if (this.name !== undefined) return this.name;

    return super.id;
  }
}

export type SequenceAlleleParams = {
  type?: LeapdnaBlockType,
  sequence: Sequence,
} & AlleleParams;

export class SequenceAllele extends Allele {
  type = LeapdnaBlockType.SequenceAllele;
  sequence: Sequence;

  constructor({ sequence, type, ...rest }: SequenceAlleleParams) {
    super({ ...rest, name: sequence.name });
    if (type !== undefined && type != LeapdnaBlockType.SequenceAllele) {
      throw new Error('Leapdna block is not a seq_allele');
    }
    this.sequence = sequence;
  }

  to_leapdna(top_level = false) {
    let res = super.to_leapdna(top_level);
    res.sequence = this.sequence.to_leapdna(false);
    return res;
  }
}
