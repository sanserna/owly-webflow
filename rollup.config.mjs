import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import del from 'rollup-plugin-delete';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url))
);
const [, pkgName] = pkg.name.split('/');

const commonPlugins = [
  alias({
    entries: {
      '@app-config': path.resolve(__dirname, 'src/config'),
    },
  }),
];
const umdOutputBaseConfig = {
  name: 'owlyWebflow',
  format: 'umd',
  globals: {
    axios: 'axios',
  },
};

export default [
  // browser-friendly UMD build
  {
    input: 'src/index.js',
    external: ['axios'],
    output: [
      {
        ...umdOutputBaseConfig,
        file: `dist/${pkgName}.umd.js`,
        sourcemap: true,
      },
      {
        ...umdOutputBaseConfig,
        file: `dist/${pkgName}.umd.min.js`,
        plugins: [terser()],
      },
    ],
    plugins: [
      ...commonPlugins,
      del({
        targets: 'dist/*',
      }),
      resolve({
        browser: true,
      }),
      json(),
      commonjs(),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.js',
    external: Object.keys(pkg.dependencies),
    output: [
      {
        file: `dist/${pkgName}.cjs.js`,
        format: 'cjs',
      },
      {
        file: `dist/${pkgName}.esm.js`,
        format: 'es',
      },
    ],
    plugins: [
      ...commonPlugins,
      resolve({
        preferBuiltins: true,
      }),
      json(),
      commonjs(),
    ],
  },
];
