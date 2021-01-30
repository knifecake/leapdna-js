import { transpose, union, submatrix, isdigit, transpose_slice, MatrixSlice } from '../src/utils';

describe('Helpers', () => {
  it ('tells if a character is a digit', () => {
    expect(isdigit('a')).toBeFalse();
    expect(isdigit('9')).toBeTrue();
    expect(isdigit('9')).toBeTrue();
  });

  it ('computes the transpose of a matrix', () => {
    expect(transpose([[1]])).toEqual([[1]]);
    expect(transpose([[1,2], [3,4]])).toEqual([[1,3], [2,4]]);
    expect(transpose([[1,2,3], [4,5,6]])).toEqual([[1,4], [2,5], [3,6]]);
    expect(transpose([[1,4], [2,5], [3,6]])).toEqual([[1,2,3], [4,5,6]]);
  });

  it ('computes the transpose of a slice', () => {
    let slice: MatrixSlice = [[1,2], [3,4]];
    expect(transpose_slice(slice)).toEqual([[2,1], [4,3]]);
  })

  it ('computes a submatrix from a square matrix', () => {
    const mat = [[1,2,3], [4,5,6], [7,8,9]];

    expect(submatrix(mat, [[0,0], [Infinity, Infinity]])).toEqual(mat);
    expect(submatrix(mat, [[1,1], [Infinity, Infinity]])).toEqual([[5,6], [8,9]]);
    expect(submatrix(mat, [[0,0], [-2, -2]])).toEqual([[1,2], [4,5]]);
    expect(submatrix(mat, [[-2,-2], [Infinity, Infinity]])).toEqual([[5,6], [8,9]]);
  });

  it ('computes a submatrix from a non-square matrix', () => {
    const mat = [[1,2,3], [4,5,6], [7,8,9], [1,2,3]];

    expect(submatrix(mat, [[0,0], [Infinity, Infinity]])).toEqual(mat);
    expect(submatrix(mat, [[1,1], [3,2]])).toEqual([[5,6], [8,9], [2,3]]);
  });

  it ('computes a submatrix given negative slices', () => {
    const mat = [[1,2,3], [4,5,6], [7,8,9]];

    expect(submatrix(mat, [[-1, 0], [-1, Infinity]])).toEqual([[7,8,9]]);
    expect(submatrix(mat, [[0, -1], [Infinity, -1]])).toEqual([[3], [6], [9]]);
  });

  it ('computes the union of lists', () => {
    expect(union([1,2], [3,4])).toEqual([1,2,3,4]);
    expect(union([1,2], [2,3])).toEqual([1,2,3]);
    expect(union([1,2], [1,3], [1,4])).toEqual([1,2,3,4]);
  });
});
