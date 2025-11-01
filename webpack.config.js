// webpack.config.js
const path = require('path');

module.exports = [
  // Renderer (UI) - main.ts is compiled separately with tsc
  {
    mode: 'production',
    target: 'electron-renderer',
    entry: { renderer: path.resolve(__dirname, 'src/renderer.jsx') },
    output: {
      path: path.resolve(__dirname, 'lib'),
      filename: 'renderer.js',
      libraryTarget: 'commonjs2',
    },
    resolve: { extensions: ['.js', '.jsx'] },
    externals: {
      '@getflywheel/local-components': 'commonjs @getflywheel/local-components',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
      ],
    },
  },
];
