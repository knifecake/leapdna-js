import typescript from '@rollup/plugin-typescript';

import * as pkg from './package.json';

const banner = `/**
 * ${pkg.name} - ${pkg.description}
 * @version ${pkg.version}
 *
 * @copyright ${pkg.author}
 * @license ${pkg.license}
 *
 * Built at: ${Date()}
 */`;


const umd_build = {
  input: './src/index.ts',
  plugins: [
    typescript()
  ],
  output: {
    banner,
    format: 'umd',
    file: './dist/leapdna.js',
    name: 'leapdna'
  }
}

export default command => [umd_build];
