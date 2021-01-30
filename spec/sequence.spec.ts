import 'jasmine';

import { Sequence,  SequenceParams } from '../src/sequence';
import { LeapdnaBlockType } from '../src/block';

describe('Sequence', () => {
  it ('instatinates with only the common parameters', () => {
    let input: SequenceParams = {
      id: 'unique',
      version: '3',
      type: LeapdnaBlockType.Sequence,
      leapdna: {
        generated_at: '20200430T12:00:00'
      },
      user: {
        custom_param: 'custom',
      }
    };
    let res: any = (new Sequence(input)).to_leapdna(true);
    expect(res).toEqual(input);
  });

  it ('rejects leapdna objects which are not sequences', () => {
    expect(() => {
      let input: any = { type: 'not a sequence' };
      new Sequence(input);
    }).toThrowError('Leapdna block is not a sequence');
  });

  it ('returns dparams', () => {
    let sq = new Sequence({
      repeating_region_bracketed: '[AT]2',
      flank3_bracketed: '[A]2',
      flank5_bracketed: '[B]2'
    });
    expect(sq.repeating_region_bracketed).toEqual('[AT]2');
    expect(sq.flank3_bracketed).toEqual('[A]2');
    expect(sq.flank5_bracketed).toEqual('[B]2');
  });

  it ('infers sequences from bracketed strings', () => {
    let sq = new Sequence({
      repeating_region_bracketed: '[AT]2',
      flank3_bracketed: '[A]2',
      flank5_bracketed: '[B]2'
    });
    expect(sq.repeating_region_seq).toEqual('ATAT');
    expect(sq.flank3_seq).toEqual('AA');
    expect(sq.flank5_seq).toEqual('BB');
  });

  it ('prefers explicit sequence values over bracketed derivations', () => {
    let sq = new Sequence({
      repeating_region_bracketed: '[AT]2',
      flank3_bracketed: '[A]2',
      flank5_bracketed: '[B]2',
      repeating_region_seq: 'other',
      flank3_seq: 'other',
      flank5_seq: 'other'
    });
    expect(sq.repeating_region_seq).toEqual('other');
    expect(sq.flank3_seq).toEqual('other');
    expect(sq.flank5_seq).toEqual('other');
  });

  it ('converts from bracketed notation to sequence', () => {
    let f = Sequence._bracketed_to_seq;

    expect(f('')).toEqual('');
    expect(f('ABCD')).toEqual('ABCD');
    expect(f('AB CD')).toEqual('AB CD');
    expect(f('[A]2')).toEqual('AA');
    expect(f('[A]3B')).toEqual('AAAB');
    expect(f('A[B]2')).toEqual('ABB');
    expect(f('AB [C]3 DE')).toEqual('AB CCC DE');
    expect(f('[A]2[B]2')).toEqual('AABB');
    expect(f('[A]10')).toEqual('AAAAAAAAAA');
  });
});
