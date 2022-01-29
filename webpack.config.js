const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // webpack5 已经集成，无需安装
const isDev = process.env.NODE_ENV === 'dev'; // 因为构建比较简单，就不拆分成 webpack.dev.js 这种形式，后续如有需要可在进行拆分
module.exports = {
  mode: isDev ? 'none' : 'production', // 这样可以支持tree-shaking/scope-hosting等特性
  entry: {
    'clue-report': path.resolve(__dirname, './core/clue-report.js'),
  },
  output: {
    filename: '[name].min.js',
    library: {
      name: 'clueReport', // 暴露出去的库的名称 - library
      type: 'umd', // 支持库引入的方式 - libraryTarget
      export: 'default',
    },
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'core'),
          // path.resolve(__dirname, "node_modules/regenerator-runtime"),
        ],
        use: () => {
          const jsLoaderArr = ['eslint-loader'];

          if (!isDev) {
            jsLoaderArr.unshift('babel-loader'); // @babel/cli是Babel的命令行工具，改成webpack后，改用babel-loader
          }

          return jsLoaderArr;
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimize: !isDev,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // 不将注释提取到单独的文件中，这样的话就不会生成LICENSE.text文件了
      }),
    ],
  },
};
