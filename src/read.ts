import Papa from 'papaparse';

import { Study } from "./study";
import { Locus } from "./locus";
import { SequenceAllele, Allele } from "./allele";
import { Sequence } from "./sequence";
import { Block } from "./block";
import { transpose, MatrixSlice, submatrix, transpose_slice } from './utils';

export function load_leapdna(input: string | object) {
  let obj;
  if (typeof input == 'string') {
    obj = JSON.parse(input);
  } else {
    obj = input;
  }

  let params;
  switch (obj.type) {
    case 'study':
      params = {...obj, loci: obj.loci.map(load_leapdna) };
      return new Study(params);
    case 'locus':
      params = { ...obj, alleles: obj.alleles.map(load_leapdna) };
      return new Locus(params);
    case 'seq_allele':
      params = {...obj, sequence: new Sequence(obj.sequence) };
      return new SequenceAllele(params);
    case 'allele':
      return new Allele(obj);
    case 'sequence':
      return new Sequence(obj);
    case 'block':
      return new Block(obj);
    default:
      throw new Error(`Unkown leapdna block type "${obj.type}"`);
  }
}

export type ReadTableOptions = {
  delimiter?: string,
  newline?: string,
  row_indexing?: 'auto' | 'alleles' | 'loci',
  na_string?: string,
  slice?: MatrixSlice,
  sample_size_slice?: MatrixSlice,
  h_obs_slice?: MatrixSlice
}

export function load_study_table(
  input: string | File | NodeJS.ReadableStream,
  options: ReadTableOptions = {}): Study {

  let  {
    delimiter =  '',
    newline = '',
    na_string = '',
    row_indexing = '',
    slice = [[1, 1], [Infinity, Infinity]],
    h_obs_slice,
    sample_size_slice,
  } = options;

  if (na_string == '') na_string = 'NA';

  let { data: matrix, errors, meta } = Papa.parse(input, {
    delimiter,
    newline,
    transform: (v: string, i: number) => i > 0 && v == na_string ? 0 : v,
  });

  if (errors.length !== 0) {
    throw new Error('Could not parse tabular file');
  }

  // some csv files have an empty row at the end, remove it
  if (matrix[matrix.length - 1].length == 1) matrix.pop();

  // auto decide if the rows are the alleles or the loci
  if (row_indexing == '' && matrix.length < matrix[0].length) row_indexing = 'loci';

  // we need the rows to be the alleles
  if (row_indexing == 'loci') {
    // transpose the matrix
    matrix = transpose(matrix);

    // and recalculate the slice coordinates
    slice = transpose_slice(slice);
    if (sample_size_slice !== undefined) sample_size_slice = transpose_slice(sample_size_slice);
    if (h_obs_slice !== undefined) h_obs_slice = transpose_slice(h_obs_slice);
  }

  // project slice onto the first row to obtain locus names
  const locus_names: string[] = submatrix(matrix, [[0, slice[0][1]], [0, slice[1][1]]])[0];

  // project slice onto the first column to obtain allele names
  const allele_names: string[] = transpose(submatrix(matrix, [[slice[0][0], 0], [slice[1][0], 0]]))[0];

  // set the headers in the matrix slice
  let subm = submatrix(matrix, slice);
  subm = subm.map((row: string[], i: number) => {
    return [allele_names[i]].concat(row);
  });
  subm.unshift([''].concat(locus_names));

  let study = Study.from_matrix(subm);

  // get the sample sizes and add them to the study
  if (sample_size_slice !== undefined) {
    let sample_sizes = submatrix(matrix, sample_size_slice)[0];
    for (let locus of Object.values(study.loci)) {
      locus.sample_size = +sample_sizes[locus_names.indexOf(locus.name)];
    }
  };

  // get the observed heterozygosities and add them to the study
  if (h_obs_slice !== undefined) {
    let h_obs = submatrix(matrix, h_obs_slice)[0];
    for (let locus of Object.values(study.loci)) {
      locus.h_obs = +h_obs[locus_names.indexOf(locus.name)];
    }
  }

  return study;
}

export function load_study_familias(contents: string, newline: string = '\n'): Study {
  let loci: Locus[] = [];
  let locus_name: string | null = null;
  let locus_alleles: Allele[] = [];
  for (const line of contents.split(newline)) {
    if (locus_name === null) {
      locus_name = line;
    } else {
      if (line != "") {
        const [name, frequency] = line.split('\t', 2);
        locus_alleles.push(new Allele({ name, frequency: +frequency }));
      } else {
        // finished with the current locus
        loci.push(new Locus({ name: locus_name, alleles: locus_alleles }));
        locus_name = null;
        locus_alleles = [];
      }
    }
  }

  return new Study({ loci });
}
