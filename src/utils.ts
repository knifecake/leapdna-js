export const isdigit = (d: string) => '/' < d && d < ':';

export type Matrix = any[][];
export type MatrixSlice = [[number, number], [number, number]];

export function transpose(matrix: Matrix): Matrix {
  return matrix[0].map((_col, i) => matrix.map(row => row[i]));
};

export function transpose_slice(slice: MatrixSlice): MatrixSlice {
  return [[slice[0][1], slice[0][0]],
          [slice[1][1], slice[1][0]]];
}

export function submatrix(matrix: Matrix, slice: MatrixSlice): Matrix {
  const north_west = slice[0];
  // make sure the ranges make sense and make them inclusive by adding 1 so
  // that we can use Array.slice
  const south_east: any = [1 + Math.min(matrix.length, slice[1][0]),
                           1 + Math.min(matrix[0].length,    slice[1][1])];

  // make sure these work with the last row of a matrix
  if (south_east[0] == 0) south_east[0] = undefined;
  if (south_east[1] == 0) south_east[1] = undefined;

  return matrix.slice(north_west[0], south_east[0]).map(row => {
    return row.slice(north_west[1], south_east[1]);
  });
};

export function union(...arrays: any[]): any[] {
  return [...new Set(arrays[0].concat(...arrays.slice(1)))];
};


export interface Hashable {
  id: string
};

export type Dict<T extends Hashable> = {
  [key: string]: T
};

export function to_dict<T extends Hashable>(list: T[]): Dict<T> {
  let res: { [id: string]: any } = {};
  list.forEach(item => {
    res[item.id] = item;
  });
  return res;
}
