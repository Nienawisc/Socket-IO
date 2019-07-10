const path = require('path');

module.exports = {
    entry: './src/client/client.ts',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          exclude: /node_modules/,
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
      filename: 'client.bundle.js',
      path: path.resolve(__dirname, 'bin/client')
    },
    devtool: 'inline-source-map'
  };