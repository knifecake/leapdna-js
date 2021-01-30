import { Block } from "./block";
import { Study } from "./study";
import { ReadTableOptions } from "./read";
import Papa from "papaparse";
import { transpose } from "./utils";

export function dump_leapdna(block: Block): string {
  return JSON.stringify(block.to_leapdna(true));
}

export function dump_familias(fs: Study, newline = '\n') {
  return Object.values(fs.loci).map(locus => {
    return locus.name + newline +
      Object.values(locus.alleles).map(allele => {
      return allele.name + '\t' + allele.frequency;
    }).join(newline) + newline; // extra newline after each locus
  }).join(newline);
}

export function dump_table(fs: Study, options: ReadTableOptions) {
    // set default values for the parameters
    const {
      delimiter = ',',
      newline = '\r\n',
      row_indexing = 'alleles',
      na_string = ''
    } = options;

    let matrix = fs.to_matrix();

    // transpose the matrix if we want loci in rows
    if (row_indexing == 'loci') {
      matrix = transpose(matrix);
    }

    // transform null frequnecies to na_string
    matrix = matrix.map(row => {
      return row.map(cell => {
        return cell === 0 ? na_string : cell;
      })
    });

    return Papa.unparse(matrix, { newline, delimiter });
}
