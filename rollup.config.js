import typescript from 'rollup-plugin-typescript2';
import postcss from 'rollup-plugin-postcss';
import pkg from './package.json' with { type: "json" };

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    },
    {
      file: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ],
  plugins: [
    postcss({
      extract: 'styles.css',
      modules: true,
    }),
    typescript({ objectHashIgnoreUnknownHack: true }),
  ],
  external: ['react', 'react-dom', 'react/jsx-runtime', '@ag-ui/client'],
};