/*
  % stmts	语句覆盖率	是不是每个语句都执行了？
  % Branch	分支覆盖率	是不是每个 if 代码块都执行了？
  % Funcs	函数覆盖率	是不是每个函数都调用了？
  % Lines	行覆盖率	是不是每一行都执行了？

 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  collectCoverage: false, // 是否显示覆盖率报告
  testEnvironment: 'jsdom', // 测试环境改成浏览器环境
  collectCoverageFrom: ['core/clue-report.js'], // 告诉 jest 哪些文件需要经过单元测试测试
};
