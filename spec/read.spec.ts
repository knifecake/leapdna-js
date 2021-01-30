import 'jasmine';
import { readFileSync } from 'fs';

import { load_leapdna, load_study_table, load_study_familias } from '../src/read';

// test blocks
import basic_block from './files/basic.leapdna.json';
import sequence from './files/sequence.leapdna.json';
import allele from './files/allele.leapdna.json';
import ce_allele from './files/ce_allele.leapdna.json';
import sequence_allele from './files/sequence_allele.leapdna.json';
import ce_locus from './files/ce_locus.leapdna.json';
import study from './files/study.leapdna.json';
import unkown from './files/unkown.leapdna.json';

describe('read_leapdna', () => {
    it ('reads a generic block from a string', () => {
      let res = load_leapdna(JSON.stringify(basic_block));
      expect(res.to_leapdna(true)).toEqual(basic_block);
    });

    it ('reads a generic block', () => {
        let res = load_leapdna(basic_block);
        expect(res.to_leapdna(true)).toEqual(basic_block);
    });

    it ('reads a sequence block', () => {
        let res = load_leapdna(sequence);
        expect(res.to_leapdna()).toEqual(sequence);
    });

    it ('reads an allele block', () => {
      let res = load_leapdna(allele);
      expect(res.to_leapdna()).toEqual(allele);
    });

    it ('reads a capillary electrophoresis allele block', () => {
      let res = load_leapdna(ce_allele);
      expect(res.to_leapdna()).toEqual(ce_allele);
    });

    it ('reads a sequence allele block', () => {
      let res = load_leapdna(sequence_allele);
      let expected = {
        ...sequence_allele,
        name: sequence_allele.sequence.name,
        sequence: {
          ...sequence_allele.sequence,
          repeating_region_seq: 'ATTGATTGATTGATTGATTGATTGATTGATTGATTGATTGATTGAT'
        }
      };
      expect(res.to_leapdna()).toEqual(expected);
    });

    it ('reads a locus block with ce_alleles', () => {
      let res = load_leapdna(ce_locus);
      expect(res.to_leapdna()).toEqual(ce_locus);
    });

    it ('reads a study', () => {
      let res = load_leapdna(study);
      expect(res.to_leapdna()).toEqual(study);
    });

    it ('refuses to read an unkown block', () => {
        expect(() => {
            load_leapdna(unkown)
        }).toThrowError('Unkown leapdna block type "invalid"');
    });
});

describe ('read_study_table', () => {
  it ('rejects invalid files', () => {
    const data = readFileSync('spec/files/basic.leapdna.json', 'utf8');
    expect(() => {
      load_study_table(data);
    }).toThrowError('Could not parse tabular file');
  });

  it ('reads a csv file', () => {
    const data = readFileSync('spec/files/study.csv', 'utf8');
    let study = load_study_table(data);
    expect(study.all_locus_names()).toEqual(['M1', 'M2', 'M3']);
    expect(study.all_allele_names()).toEqual(['1', '2', '3']);
    expect(study.get_frequency('M1', '3')).toEqual(0);
    expect(study.get_frequency('M2', '2')).toEqual(0.3333);
  });

  it ('reads sample sizes and expected heterozygosities', () => {
    const data = readFileSync('spec/files/study-sample-size.csv', 'utf8');
    let study = load_study_table(data, {
      slice: [[1,1], [3,3]],
      sample_size_slice: [[-2,1], [-2,Infinity]],
      h_obs_slice: [[-1,1], [-1,Infinity]]
    });

    expect(study.loci['M1'].sample_size).toEqual(120);
    expect(study.loci['M2'].sample_size).toEqual(60);
    expect(study.loci['M3'].sample_size).toEqual(30);
  });

  it ('reads a transposed csv file with a non-comma separator in auto mode', () => {
    const data = readFileSync('spec/files/study-transpose.csv', 'utf8');
    let study = load_study_table(data);
    expect(study.all_locus_names()).toEqual(['M1', 'M2']);
    expect(study.all_allele_names()).toEqual(['1', '2', '3', '4']);
    expect(study.get_frequency('M1', '3')).toEqual(0.2);
    expect(study.get_frequency('M2', '2')).toEqual(0.3333);
    expect(study.get_frequency('M2', '4')).toEqual(0.3333);
  });

  it ('reads a slice of a csv file', () => {
    const data = readFileSync('spec/files/study.csv', 'utf8');
    let study = load_study_table(data, { slice: [[2, 2], [Infinity, Infinity]] });
    expect(study.all_locus_names()).toEqual(['M2', 'M3']);
    expect(study.all_allele_names()).toEqual(['2', '3']);
    expect(study.get_frequency('M2', '2')).toEqual(0.3333);

    study = load_study_table(data, { slice: [[1,1], [2, 2]] });
    expect(study.all_locus_names()).toEqual(['M1', 'M2']);
    expect(study.all_allele_names()).toEqual(['1', '2']);
    expect(study.get_frequency('M1', '3')).toEqual(0);
    expect(study.get_frequency('M2', '2')).toEqual(0.3333);
  });

  it ('reads a slice of a transposed csv file with a non-comma separator in auto mode', () => {
    const data = readFileSync('spec/files/study-transpose.csv', 'utf8');
    let study = load_study_table(data, { slice: [[1, 2], [Infinity, Infinity]]});
    expect(study.all_locus_names()).toEqual(['M1', 'M2']);
    expect(study.all_allele_names()).toEqual(['2', '3', '4']);
    expect(study.get_frequency('M1', '3')).toEqual(0.2);
    expect(study.get_frequency('M2', '2')).toEqual(0.3333);
    expect(study.get_frequency('M2', '4')).toEqual(0.3333);
  });

  it ('reads the familias file format', () => {
    const data = readFileSync('spec/files/study.familias.txt', 'utf8');
    let study = load_study_familias(data);
    expect(study.all_locus_names()).toEqual(['Locus 1', 'Locus 2']);
    expect(study.all_allele_names()).toEqual(['a', 'b', 'c']);
    expect(study.get_frequency('Locus 1', 'a')).toEqual(0.2);
    expect(study.get_frequency('Locus 2', 'c')).toEqual(0.5);
  });
});
