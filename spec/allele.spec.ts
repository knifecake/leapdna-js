import 'jasmine';

import { LeapdnaBlockType } from '../src/block';
import { Allele, SequenceAllele }  from '../src/allele';
import { Sequence } from '../src/sequence';

describe('Allele', () => {
  it ('can be instantiated', () => {
    let input = {
      type: LeapdnaBlockType.Allele,
      name: 'allele name'
    };

    let a = new Allele(input);

    expect(a.name).toEqual('allele name');
  });

  it ('rejects blocks of the wrong type', () => {
    expect(() => {
      new Allele({name: 'something', type: LeapdnaBlockType.Sequence })
    }).toThrowError('Leapdna block is not an allele');
  });

  it ('returns the name as the hash if present', () => {
    let a = new Allele({ name: 'name' });
    expect(a.id).toEqual('name');

    let b = new Allele();
    expect(b.id).toBeTruthy();
  });
});

describe('SequenceAllele', () => {
  it ('can be instantiated', () => {
    let sq = new Sequence();
    let a = new SequenceAllele({ sequence: sq });

    expect(a.sequence).toBe(sq);
  });

  it ('rejects blocks of the wrong type', () => {
    expect(() => {
      new SequenceAllele({type: LeapdnaBlockType.Study, sequence: new Sequence()});
    }).toThrowError('Leapdna block is not a seq_allele');
  })

  it ('returns the sequence name as the hash', () => {
    let a = new SequenceAllele({ sequence: new Sequence({ name: 'sqa' }) });
    expect(a.id).toEqual('sqa');
  })
});
