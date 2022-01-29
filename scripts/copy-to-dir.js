// 在dep环境下，需要通过命令将clue-report.min.js移动到对应的目录

// fs-extra是fs的一个扩展，提供了非常多的便利API，并且继承了fs所有方法和为fs方法添加了promise的支持。
const fs = require('fs-extra');
const path = require('path');
const print = require('./utils/print');

const originJs = path.resolve(__dirname, '../dist/clue-report.min.js'); // 源文件路径

// 不加__dirname path.resolve返回当前的工作目录
const targetResDir = path.resolve('xxxxxx'); // 目标文件夹路径 -
const targetResJs = path.resolve('xxxxxxxxx'); // 目标文件路径

function cleanup() {
  print.info(`Starting cleanup path "${path.join(targetResJs)}".`);
  cleanup.time = Date.now();

  return Promise.all([fs.remove(path.join(targetResJs))]).then(() => {
    print.done(`Cleanup successfully in ${Date.now() - cleanup.time}ms!\n`);
  });
}

function copy() {
  print.info(`Starting copy path "${path.join(originJs)}" to ${path.join(targetResJs)}`);
  copy.time = Date.now();

  return Promise.all([fs.copy(path.join(originJs), path.join(targetResJs))]).then(() => {
    print.done(`Copy successfully in ${Date.now() - copy.time}ms!\n`);
  });
}

if (!fs.pathExistsSync(originJs)) return print.error(`The path "${originJs}" does not exist!\n`);
if (!fs.pathExistsSync(targetResDir)) return print.error(`The path "${targetResDir}" does not exist!\n`);

// eslint-disable-next-line no-console
console.log('');
cleanup()
  .then(copy)
  .catch(error => {
    // eslint-disable-next-line no-console
    console.log('');
    print.error(error.message || error);
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  });
