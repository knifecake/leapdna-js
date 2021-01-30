import 'jasmine';
import { Locus, load_leapdna, Allele } from '../src';

import h_exp_locus from './files/h_exp_locus.leapdna.json';
import { LeapdnaBlockType } from '../src/block';

describe ('Locus', () => {
  it ('can be instantiated with a name', () => {
    expect(new Locus({ name: 'Locus name' })).toBeTruthy();
  });

  it ('rejects other blocks', () => {
    expect(() => {
      new Locus({ name: 'name', type: LeapdnaBlockType.Sequence });
    }).toThrowError('Leapdna block is not a locus');
  });

  it ('can handle heterozygosity and sample size', () => {
    const l = new Locus({ name: 'L', h_obs: 0.2, h_exp: 0.3, sample_size: 30 });
    expect(l.h_exp).toEqual(0.3);
    expect(l.h_obs).toEqual(0.2);
    expect(l.sample_size).toEqual(30);
  });

  it ('rejects invalid values for heterozygosities and sample sizes', () => {
    const l = new Locus({ name: 'L' });
    expect(() => {
      l.sample_size = -1;
    }).toThrowError('Sample size is not non-negative');

    expect(() => {
      l.h_exp = 1.2;
    }).toThrowError('H_exp is not between 0 and 1');

    expect(() => {
      l.h_obs = -0.1;
    }).toThrowError('H_obs is not between 0 and 1');
  });

  it ('calculates h_exp if none is present but respects it if it is', () => {
    const l: any = load_leapdna(h_exp_locus);
    expect(l.h_exp).toEqual(h_exp_locus.user.h_exp);

    l.h_exp = 0.2;
    expect(l.h_exp).toEqual(0.2);
  });

  it ('calculates sample size if none is present but respects it if it is', () => {
    const l: any = load_leapdna(h_exp_locus);
    expect(l.sample_size).toEqual(h_exp_locus.user.sample_size);

    l.sample_size = 12;
    expect(l.sample_size).toEqual(12);
  });

  it ('returns the sum of the allele frequencies', () => {
    const l = new Locus({ name: 'L', alleles: [
      new Allele({ frequency: 0.25 }),
      new Allele({ frequency: 0.25})
    ] });
    expect(l._allele_frequency_sum()).toEqual(0.5);
  });

  it ('normalizes the allele frequencies', () => {
    let l = new Locus({ name: 'L', alleles: [
      new Allele({ name: 'a', frequency: 0.25 }),
      new Allele({ name: 'b', frequency: 0.25})
    ] });
    l.normalize_allele_frequencies();
    expect(l._allele_frequency_sum()).toEqual(1);
    expect(l.get_frequency('a')).toEqual(0.5);
    expect(l.get_frequency('b')).toEqual(0.5);
  });

  it ('adds a rare allele', () => {
    let l = new Locus({ name: 'L', alleles: [
      new Allele({ name: 'a', frequency: 0.25 }),
      new Allele({ name: 'b', frequency: 0.25})
    ] });

    l.add_rare_allele();
    expect(l._allele_frequency_sum()).toEqual(1);
    expect(l.get_frequency('rare')).toEqual(0.5);
  });
});
