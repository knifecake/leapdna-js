import { Block, LeapdnaBlockCommonParams, LeapdnaBlockType } from "./block";

import { isdigit } from './utils';

export type SequenceParams = {
  type?: LeapdnaBlockType.Sequence,
  name?: string,
  refseq_name?: string,
  refseq_start?: string,
  refseq_end?: string,
  repeat_motifs?: string[],
  repeating_region_seq?: string,
  flank5_seq?: string,
  flank3_seq?: string,
  repeating_region_bracketed?: string,
  flank5_bracketed?: string,
  flank3_bracketed?: string
} & LeapdnaBlockCommonParams;

export class Sequence extends Block {
  type = LeapdnaBlockType.Sequence;
  name?: string;
  refseq_name?: string;
  refseq_start?: string;
  refseq_end?: string;
  repeat_motifs?: string[];
  dprops: {
    repeating_region_seq?: string,
    flank5_seq?: string,
    flank3_seq?: string,
    repeating_region_bracketed?: string,
    flank5_bracketed?: string,
    flank3_bracketed?: string,
  } = {};


  constructor({ name,
              type,
              refseq_name,
              refseq_start,
              refseq_end,
              repeat_motifs,
              repeating_region_seq,
              repeating_region_bracketed,
              flank3_seq,
              flank3_bracketed,
              flank5_seq,
              flank5_bracketed,
              ...rest }: SequenceParams = {}) {

    super(rest);
    if (type !== undefined && type !== this.type) {
      throw new Error('Leapdna block is not a sequence');
    }

    this.name = name;
    this.refseq_name = refseq_name;
    this.refseq_start = refseq_start;
    this.refseq_end = refseq_end;
    this.repeat_motifs = repeat_motifs;
    this.repeating_region_seq = repeating_region_seq;
    this.repeating_region_bracketed = repeating_region_bracketed;
    this.flank3_seq = flank3_seq;
    this.flank3_bracketed = flank3_bracketed;
    this.flank5_seq = flank5_seq;
    this.flank5_bracketed = flank5_bracketed;
  }

  get repeating_region_seq() {
    if (this.dprops.repeating_region_seq === undefined) {
        this.dprops.repeating_region_seq =
          Sequence._bracketed_to_seq(this.dprops.repeating_region_bracketed);
    }

    return this.dprops.repeating_region_seq;
  }

  set repeating_region_seq(value) {
    this.dprops.repeating_region_seq = value;
  }

  get repeating_region_bracketed() {
    return this.dprops.repeating_region_bracketed;
  }

  set repeating_region_bracketed(value) {
    this.dprops.repeating_region_bracketed = value;
  }

  get flank3_seq() {
    if (this.dprops.flank3_seq === undefined) {
      this.dprops.flank3_seq = Sequence._bracketed_to_seq(this.dprops.flank3_bracketed);
    }
    return this.dprops.flank3_seq;
  }

  set flank3_seq(value) {
    this.dprops.flank3_seq = value;
  }

  get flank3_bracketed() {
    return this.dprops.flank3_bracketed;
  }

  set flank3_bracketed(value) {
    this.dprops.flank3_bracketed = value;
  }

  get flank5_seq() {
    if (this.dprops.flank5_seq === undefined) {
      this.dprops.flank5_seq = Sequence._bracketed_to_seq(this.dprops.flank5_bracketed);
    }
    return this.dprops.flank5_seq;
  }

  set flank5_seq(value) {
    this.dprops.flank5_seq = value;
  }

  get flank5_bracketed() {
    return this.dprops.flank5_bracketed;
  }

  set flank5_bracketed(value) {
    this.dprops.flank5_bracketed = value;
  }

  to_leapdna(top_level: boolean = false) {
    let ret = super.to_leapdna(top_level);
    if (this.name !== undefined) ret.name = this.name;
    if (this.refseq_name !== undefined) ret.refseq_name = this.refseq_name;
    if (this.refseq_start !== undefined) ret.refseq_start = this.refseq_start;
    if (this.refseq_end !== undefined) ret.refseq_end = this.refseq_end;
    if (this.repeat_motifs !== undefined) ret.repeat_motifs = this.repeat_motifs;
    if (this.repeating_region_seq !== undefined) ret.repeating_region_seq = this.repeating_region_seq;
    if (this.repeating_region_bracketed !== undefined) ret.repeating_region_bracketed = this.repeating_region_bracketed;
    if (this.flank3_seq !== undefined) ret.flank3_seq = this.flank3_seq;
    if (this.flank3_bracketed !== undefined) ret.flank3_bracketed = this.flank3_bracketed;
    if (this.flank5_seq !== undefined) ret.flank5_seq = this.flank5_seq;
    if (this.flank5_bracketed !== undefined) ret.flank5_bracketed = this.flank5_bracketed;
    return ret;
  }

  static _bracketed_to_seq(bracketed?: string) {
    if (bracketed === undefined) return bracketed;

    let seq = '', repeat = '', nrepeat = 0;
    let in_bracket = false, in_nrepeat = false;

    for (let char of bracketed) {
      if (in_nrepeat) {
        if (isdigit(char)) {
          nrepeat = 10 * nrepeat + parseInt(char);
          continue;
        } else {
          seq += repeat.repeat(nrepeat);
          in_nrepeat = false;
          repeat = '';
        }
      }

      if (char == '[' || char == '(') {
        in_bracket = true;
        repeat = '';
        continue;
      } else if (char == ']' || char == ')') {
        in_bracket = false;
        in_nrepeat = true;
        nrepeat = 0;
        continue;
      }

      if (in_bracket) {
        repeat += char;
      } else if (!in_nrepeat) {
        seq += char;
      }
    }

    return seq + repeat.repeat(nrepeat);
  }
}
