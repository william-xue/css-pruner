const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CSSPrunerPlugin } = require('../../dist/plugins/webpack.cjs');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
    // CSS Pruner plugin - analyze mode
    new CSSPrunerPlugin({
      cssFiles: ['dist/styles.css'],
      sourceDirectories: ['src'],
      mode: 'analyze',
      config: {
        reportFormat: 'console',
        verbose: true,
        whitelist: [
          // Keep React and utility classes
          /^react-/,
          /^btn-/,
          /^text-/
        ]
      },
      onAnalysisComplete: (result) => {
        console.log(`🎯 Webpack build: Found ${result.unusedSelectors.length} unused selectors`);
        const savings = result.unusedSelectors.reduce((acc, sel) => acc + sel.size, 0);
        console.log(`💾 Potential savings: ${(savings / 1024).toFixed(2)}KB`);
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
  },
};

// Alternative configuration for clean mode
// Create a separate config file or use environment variables

// const cleanModeConfig = {
//   ...module.exports,
//   plugins: [
//     ...module.exports.plugins.slice(0, -1), // Remove the analyze plugin
//     new CSSPrunerPlugin({
//       cssFiles: ['dist/**/*.css'],
//       sourceDirectories: ['src'],
//       mode: 'clean',
//       config: {
//         backup: true,
//         verbose: true
//       }
//     })
//   ]
// };
