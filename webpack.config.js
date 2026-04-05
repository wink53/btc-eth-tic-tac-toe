const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = (env) => {
  const isICP = env && env.icp;
  
  const config = {
    entry: './src/btc_eth_tic_tac_toe_assets/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'index.js',
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/btc_eth_tic_tac_toe_assets/index.html',
      }),
    ],
    mode: 'development',
    devServer: {
      port: 8000,
      hot: true,
    },
  };

  // When building for ICP, inject the canister IDs
  if (isICP) {
    config.plugins.push(
      new webpack.DefinePlugin({
        CANISTER_ID: JSON.stringify(process.env.BTC_ETH_TIC_TAC_TOE_CANISTER_ID || 'btc_eth_tic_tac_toe'),
      })
    );
  }

  return config;
};
