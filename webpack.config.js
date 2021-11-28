const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, './public/build/app.js'),
});
const sveltePreprocess = require('svelte-preprocess');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const resolve = {
  alias: {
    svelte: path.dirname(require.resolve('svelte/package.json')),
  },
  extensions: ['.mjs', '.js', '.ts', '.svelte'],
  mainFields: ['svelte', 'browser', 'module', 'main'],
};

const output = {
  path: path.join(__dirname, '/public'),
  filename: '[name].js',
  chunkFilename: '[name].[id].js',
};

const rules = [
  {
    test: /\.ts$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
  },
  {
    test: /\.svelte$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: {
          dev: !prod,
        },
        emitCss: prod,
        hotReload: !prod,
        preprocess: sveltePreprocess({ sourceMap: !prod }),
      },
    },
  },
  {
    test: /\.css$/,
    use: [MiniCssExtractPlugin.loader, 'css-loader'],
  },
  {
    // required to prevent errors from Svelte on Webpack 5+
    test: /node_modules\/svelte\/.*\.mjs$/,
    resolve: {
      fullySpecified: false,
    },
  },
];

const plugins = [
  new MiniCssExtractPlugin({
    filename: '[name].css',
  }),
];

if (!prod) plugins.push(ElectronReloadPlugin());

module.exports = {
  target: 'electron-main',
  entry: {
    'build/render': ['./src/render.ts'],
    'build/app': ['./src/electron/app.ts'],
    'build/bridge': ['./src/electron/bridge.ts'],
  },
  resolve,
  output,
  module: {
    rules,
  },
  mode,
  plugins,
  devtool: prod ? false : 'cheap-module-source-map',
  devServer: {
    hot: true,
  },
};
