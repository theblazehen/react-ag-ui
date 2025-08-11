import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'demo/App.tsx',
  output: {
    file: 'demo/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify('development'),
      preventAssignment: true,
    }),
    postcss({
      modules: true,
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      sourceMap: true,
      inlineSources: true,
    }),
  ],
};