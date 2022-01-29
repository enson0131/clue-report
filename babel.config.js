const isProduction = process.env.NODE_ENV === 'prod';

const plugins = [
  '@babel/plugin-proposal-class-properties', // 转class
  ['@babel/plugin-transform-runtime', { corejs: 3 }], // 转api
];

if (isProduction) {
  plugins.push('transform-remove-console');
}

module.exports = {
  presets: [
    [
      '@babel/preset-env', // es6转es5语法
      {
        targets: ['> 0.5%', 'last 2 versions', 'ie >= 8', 'Android >= 4.0', 'iOS >= 8'],
      },
    ],
  ],
  plugins,
};
