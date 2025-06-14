const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    content: './src/content.ts',
    background: './src/background.ts',
    offscreen: './src/offscreen.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "url": false,
      "path": false
    }
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json' },
        { from: 'src/reader.css' },
        { from: 'src/icons', to: 'icons' },
        { from: 'src/options.html', to: 'options.html' },
        { from: 'src/options.js', to: 'options.js' },
        { from: 'public/offscreen.html', to: 'offscreen.html' }
      ],
    }),
  ],
}; 