const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/btc_eth_tic_tac_toe/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/btc_eth_tic_tac_toe/index.html',
    }),
  ],
  mode: 'development',
  devServer: {
    port: 8000,
    hot: true,
  },
};
