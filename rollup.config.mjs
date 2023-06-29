import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import del from 'rollup-plugin-delete';
import analyze from 'rollup-plugin-analyzer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url))
);
const [, pkgName] = pkg.name.split('/');
const babelRuntimeVersion = pkg.dependencies['@babel/runtime'].replace(
  /[^0-9]*/,
  ''
);

const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};

const umdOutputBaseConfig = {
  name: 'owlyWebflow',
  format: 'umd',
  globals: {
    axios: 'axios',
  },
};

export default {
  input: 'src/index.js',
  external: makeExternalPredicate([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]),
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
    del({
      targets: 'dist/*',
    }),
    alias({
      entries: {
        '@app-config': path.resolve(__dirname, 'src/config'),
      },
    }),
    resolve({
      browser: true,
    }),
    json(),
    commonjs({ include: ['node_modules/**'] }),
    babel({
      babelHelpers: 'runtime',
      exclude: /node_modules/,
      presets: [['@babel/preset-env', { targets: 'defaults' }]],
      plugins: [
        ['@babel/plugin-transform-runtime', { version: babelRuntimeVersion }],
      ],
    }),
    analyze({
      hideDeps: true,
      limit: 0,
      summaryOnly: true,
    }),
  ],
};
