/****
 * 0 - off - 关闭规则
 * 1 - warn - 规则视为一个警告
 * 2 - error - 错误
 */
module.exports = {
  root: true,
  parser: 'babel-eslint',
  // 配置 eslint-config-prettier 如果同时使用了eslint和prettier发生冲突了，会关闭掉与prettier有冲突的规则，也就是使用prettier认为对的规则
  // eslint-plugin-prettier 插件附带了一个 plugin:prettier/recommended 配置，可以一次性设置插件和 eslint-config-prettier。
  extends: ['eslint:recommended', 'plugin:prettier/recommended'], // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
  //   plugins: ['prettier'], // 插件名称可以省略 eslint-plugin- 前缀
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module', // 设置"script"（默认）或"module"如果你的代码是在ECMAScript中的模块。
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-control-regex': 'off',
    'no-prototype-builtins': 'off',
    'quotes': ['error', 'single'],
    'comma-dangle': ['error', 'only-multiline'],
    'no-unused-vars': 'off',
    'indent': 'off',
    'prefer-const': 'error',
    'no-case-declarations': 'off',
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
