import { LeapdnaBlockCommonParams, LeapdnaBlockType, Block } from './block';
import { Allele, AlleleParams } from './allele';
import { Dict, to_dict, Hashable } from './utils';

type LocusParams = {
  type?: LeapdnaBlockType,
  name: string,
  h_obs?: number,
  h_exp?: number,
  sample_size?: number,
  alleles?: Allele[]
} & LeapdnaBlockCommonParams;

export class Locus extends Block implements Hashable {
  type = LeapdnaBlockType.Locus;
  name: string;
  alleles: Dict<Allele>;
  dprops: {
    h_exp?: number,
    h_obs?: number,
    sample_size?: number
  } = {};

  constructor({ name, type, h_obs, h_exp, sample_size, alleles, ...rest}: LocusParams) {
    super(rest);
    if (type !== undefined && type !== this.type) {
      throw new Error('Leapdna block is not a locus');
    }

    this.name = name;
    if (h_exp !== undefined) this.h_exp = h_exp;
    if (h_obs !== undefined) this.h_obs = h_obs;
    if (sample_size !== undefined) this.sample_size = sample_size;
    this.alleles = alleles === undefined ? {} : to_dict(alleles);
  }

  to_leapdna(top_level = false) {
    let ret = super.to_leapdna(top_level);
    ret.name = this.name;
    ret.alleles = Object.values(this.alleles).map(a => a.to_leapdna(false));
    return ret;
  }

  get_frequency(name: string) {
    return this.alleles[name].frequency;
  }

  _calculate_h_exp() {
    return 1 - Object.values(this.alleles).reduce((acc: number, a: any) => acc + a.frequency * a.frequency, 0);
  }

  _calculate_sample_size() {
    return Object.values(this.alleles).reduce((acc: number, a: any) => acc + a.count, 0);
  }

  _allele_frequency_sum() {
    return Object.values(this.alleles).reduce((acc: number, a: any) => acc + a.frequency, 0);
  }

  normalize_allele_frequencies() {
    const total = this._allele_frequency_sum();
    Object.values(this.alleles).forEach((a: any) => {
      a.frequency /= total;
    });
  }

  add_rare_allele() {
    const total = this._allele_frequency_sum();
    if (total < 1) {
      this.alleles['rare'] = (new Allele({ name: 'rare', frequency: 1 - total }));
    }
  }

  get h_obs() {
    return this.dprops.h_obs;
  }

  set h_obs(value) {
    if (value !== undefined && !(0 <= value && value <= 1)) {
      throw new Error('H_obs is not between 0 and 1');
    }
    this.dprops.h_obs = value;
  }

  get h_exp() {
    if (this.dprops.h_exp === undefined) {
      this.dprops.h_exp = this._calculate_h_exp();
    }

    return this.dprops.h_exp;
  }

  set h_exp(value) {
    if (value !== undefined && !(0 <= value && value <= 1)) {
      throw new Error('H_exp is not between 0 and 1');
    }
    this.dprops.h_exp = value;
  }

  get sample_size() {
    if (this.dprops.sample_size === undefined) {
      this.dprops.sample_size = this._calculate_sample_size();
    }

    return this.dprops.sample_size;
  }

  set sample_size(value) {
    if (value !== undefined && value < 0) {
      throw new Error('Sample size is not non-negative');
    }

    this.dprops.sample_size = value;
  }

  get id() {
    return this.name;
  }
}
