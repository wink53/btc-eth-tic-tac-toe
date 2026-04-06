const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/game_frontend/index.js',
  output: {
    filename: 'bundle.[contenthash].js',
    path: path.resolve(__dirname, 'src/game_frontend/assets'),
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@declarations': path.resolve(__dirname, 'src/declarations'),
    },
    fallback: {
      process: require.resolve('process/browser'),
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/game_frontend/index.html',
      filename: 'index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.CANISTER_ID_GAME_BACKEND': JSON.stringify('bkyz2-fmaaa-aaaaa-qaaaq-cai'),
      'process.env.DFX_NETWORK': JSON.stringify('local'),
    }),
  ],
};
