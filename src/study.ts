import { Block, LeapdnaBlockCommonParams, LeapdnaBlockType } from "./block";
import { Locus } from "./locus";
import { Allele } from "./allele";
import { Matrix, transpose, Dict, to_dict, union } from "./utils";

export type StudyParams = {
  type?: LeapdnaBlockType,
  loci?: Locus[],
  metadata?: any
} & LeapdnaBlockCommonParams;

export class Study extends Block {
  type = LeapdnaBlockType.Study;
  loci: Dict<Locus>;
  metadata?: any;

  constructor({loci, type, metadata, ...rest}: StudyParams = {}) {
    super(rest);
    if (type !== undefined && type !== this.type) {
      throw new Error('Leapdna block is not a study');
    }

    this.loci = loci === undefined ? {} : to_dict(loci);
    this.metadata = metadata;
  }

  all_locus_names() {
    return Object.keys(this.loci);
  }

  all_allele_names(): string[] {
    return union(...this.all_locus_names().map(lname => {
      return Object.keys(this.loci[lname].alleles);
    }));
  }

  get_frequency(lname: string, aname: string, def: number = 0): number {
    const res = this.loci[lname].alleles[aname];
    return res === undefined ? def : (res.frequency ? res.frequency : def);
  }

  normalize_allele_frequencies() {
    Object.values(this.loci).map(locus => locus.normalize_allele_frequencies());
  }

  add_rare_alleles() {
    Object.values(this.loci).map(locus => locus.add_rare_allele());
  }

  to_leapdna(top_level = false) {
    let ret = super.to_leapdna(top_level);
    if (Object.keys(this.loci).length > 0)
      ret.loci = Object.values(this.loci).map(l => l.to_leapdna());
    if (this.metadata !== undefined) ret.metadata = this.metadata;
    return ret;
  }

  static from_matrix(matrix: Matrix) {
    const tmatrix = transpose(matrix);

    // first row is a header with locus names
    const locus_names: string[] = matrix[0].slice(1);

    // first column is a header with allele names
    const allele_names: string[] = tmatrix[0].slice(1);

    const loci: Locus[] = tmatrix.slice(1).map((loc, i) => {
      const alleles: Allele[] = loc.slice(1).reduce((prev, curr, j) => {
        if (curr) {
          let freq = parseFloat(curr);
          if (isNaN(freq))
            throw new Error('Did not understand frequency value ' + curr);
          return prev.concat(new Allele({ name: allele_names[j], frequency: freq }));
        }

        return prev;
      }, []);
      return new Locus({ name: locus_names[i], alleles });
    });

    return new this({ loci });
  }

  to_matrix(): Matrix {
    const column_headers = this.all_locus_names();
    const row_headers = this.all_allele_names();

    let res = row_headers.map(aname => {
      let row: (string | number)[] = [aname];
      return row.concat(column_headers.map(lname => {
        return this.get_frequency(lname, aname);
      }));
    });

    res.unshift([''].concat(column_headers));

    return res;
  }
}
