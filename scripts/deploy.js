/**
 * https://github.com/shelljs/shelljs
 * 弊端: 因为是通过npm包去模拟shell命令执行部署，首次使用需要安装依赖
 * 或者后续维护过程中，在该文件新增了依赖，也需要到服务器去安装依赖
 * 但一般部署定下来后，后续是不会怎么变得，因此感觉还可以接受
 */

const path = require('path');
const print = require('./utils/print');
const shell = require('shelljs');
const envPath = path.join(__dirname, '../core/config/env.js');
const fs = require('fs-extra');

const originJs = path.resolve(__dirname, '../dist/clue-report.min.js'); // 源文件路径
const targetResDir = path.resolve(`xxxx`); // 目标文件夹路径
const targetResJs = path.resolve(`xxxxxx`); // 目标文件路径

shell.set('-e'); // 出错时退出

if (!shell.which('git')) {
  print.error('Sorry, this script requires git');
  shell.exit(1);
}

if (!shell.which('yarn')) {
  print.error('Sorry, this script requires yarn');
  shell.exit(1);
}

print.info('更新代码...');
shell.exec('git pull ');

print.info('更新依赖...');
shell.exec('yarn');

// 修改env
print.info('修改env文件...');
try {
  fs.outputFileSync(envPath, `module.exports = '${process.env.NODE_ENV}';`);
} catch (err) {
  print.error('修改失败: ', err);
  return;
}

print.info('打包构建...');
shell.exec('yarn build');

if (!fs.pathExistsSync(targetResDir)) {
  print.info(`"${targetResDir}" 目录不存在，开始创建目录\n`);
  try {
    fs.ensureDirSync(targetResDir);
  } catch (err) {
    print.error('ensureDirSync失败: ', err);
    return;
  }
  print.info('创建目录完成\n');
}

print.info('开始复制...');
shell.cp('-r', originJs, targetResJs);

const isError = shell.error();
if (isError) {
  shell.exit(1);
}
print.done('All Success...');
