import 'jasmine';
import { Locus } from '../src/locus';
import { Allele } from '../src/allele';
import { Study } from '../src/study';
import { LeapdnaBlockType } from '../src/block';

describe('Study', () => {
  describe('works with allele frequency matrices', () => {
    const l1 = new Locus({name: 'L1', alleles: [new Allele({ name: 'a', frequency: 0.2}), new Allele({name: 'b', frequency: 0.8})]});
    const l2 = new Locus({name: 'L2', alleles: [new Allele({ name: 'b', frequency: 0.5}), new Allele({ name: 'c', frequency: 0.5} )]});
    const fs = new Study({loci: [l1, l2] });
    const expected = [
        ['', 'L1', 'L2'],
        ['a', 0.2, 0],
        ['b', 0.8, 0.5],
        ['c', 0, 0.5]
    ];

    it ('rejects invalid block types', () => {
      expect(() => {
        new Study({ type: LeapdnaBlockType.Sequence });
      }).toThrowError('Leapdna block is not a study');
    });

    it ('returns the collection of every locus name', () => {
        expect(fs.all_locus_names()).toEqual(['L1', 'L2']);
    });

    it ('returns the collection of every allele name', () => {
        expect(fs.all_allele_names()).toEqual(['a', 'b', 'c']);
    });

    it ('returns the frequency of an allele at a particular locus', () => {
        expect(fs.get_frequency('L1', 'b')).toEqual(0.8);
        expect(fs.get_frequency('L1', 'c')).toEqual(0);
        expect(fs.get_frequency('L1', 'c', 0.1)).toEqual(0.1);
    });

    it ('can be turned into an allele frequency matrix', () => {
        expect(fs.to_matrix()).toEqual(expected);
    });

    it ('can be converted from an allele frequency matrix', () => {
        let newfs = Study.from_matrix(expected);

        expect(fs.all_locus_names()).toEqual(['L1', 'L2']);
        expect(fs.all_allele_names()).toEqual(['a', 'b', 'c']);
    });

    it ('rejects non numeric allele frequencies', () => {
      expect(() => {
        Study.from_matrix([['', 'L1'],['A1', 'asd']]);
      }).toThrowError('Did not understand frequency value asd');
    });

    it ('normalizes allele frequencies', () => {
      const study = new Study({ loci: [
        new Locus({ name: 'L1', alleles: [
          new Allele({ name: 'a', frequency: 0.25 }),
          new Allele({ name: 'b', frequency: 0.25 })
        ]})
      ]});

      study.normalize_allele_frequencies()
      expect(study.get_frequency('L1', 'a')).toEqual(0.5);
      expect(study.get_frequency('L1', 'b')).toEqual(0.5);
    });

    it ('adds a rare allele', () => {
      const study = new Study({ loci: [
        new Locus({ name: 'L1', alleles: [
          new Allele({ name: 'a', frequency: 0.25 }),
          new Allele({ name: 'b', frequency: 0.25 })
        ]})
      ]});

      study.add_rare_alleles();
      expect(study.get_frequency('L1', 'rare')).toEqual(0.5);
    });
  });
});
