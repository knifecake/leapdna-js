import 'jasmine';

import { Block,  LeapdnaBlockType } from '../src/block';


describe('LeapdnaBlock', () => {
  it ('instatinates with all the common parameters', () => {
    let input = {
      id: 'unique',
      version: '3',
      type: LeapdnaBlockType.Block,
      leapdna: {
        generated_at: '20200430T12:00:00'
      },
      user: {
        custom_param: 'custom'
      }
    };

    let res: any = (new Block(input)).to_leapdna(true);
    expect(res).toEqual(input);
  });

  it ('instantiates with the minimum number of params', () => {
    let input = {
      type: LeapdnaBlockType.Block,
    };
    let res = new Block(input);
    expect(res.to_leapdna()).toEqual(input);
  });

  it ('rejects unsupported block types', () => {
    expect(() => {
      let input: any = { type: 'unsupported' };
      new Block(input)
    }).toThrowError('Leapdna block is not a block');
  });

  it ('is hashable and generates automatic ids', () => {
    let b1 = new Block();
    let b2 = new Block();

    expect(b1.id === undefined).toBeFalse();
    expect(b2.id === undefined).toBeFalse();

    expect(b1.id == b2.id).toBeFalse();
  });
});
