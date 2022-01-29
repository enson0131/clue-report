---
highlight: vs2015
theme: condensed-night-purple
---
# 前言

在实现一个行为上报的SDK的过程中踩了很多坑，也学到了很多知识点，因此以书面的形式总结一下自己的经验。

本文将从0到1讲述我的行为上报SDK的开发历程。

# 目标
- [ ] 实现 umd 格式 （支持 AMD/CJS/ESM 模块引入或者 script 引入）
- [ ] 配置 babel
- [ ] 配置 eslint、prettier、commintLint
- [ ] 实现业务逻辑
- [ ] 配置单元测试 Jest
- [ ] CICD
- [ ] 发布到npm

# 正文

## 项目结构

```js
├── babel.config.js // babel 配置
├── .commitlintrc.js // git commit 配置
├── .eslintrc.js // eslint 配置
├── .gitignore // git 忽略文件
├── .npmignore // npm 忽略文件
├── README.md // 项目介绍
├── dist // 生产目录
│   └── bundle.js // 打包后的 js 文件
├── package-lock.json
├── package.json // 项目配置
├── src // 源文件目录
│   ├── index.js // 入口文件
│   └── util.js // 功能函数
└── webpack.config.js // webpack配置
```

## 构建配置

俗话说，工欲善其事，必先利其器，开发 sdk 也是一样的道理，有一个良好的构建配置将减少 sdk 的开发和维护成本。

### 配置 babel

babel 可以帮我们将js语法/api转化为兼容目标浏览器的语法，使得开发者在不需要关心浏览器兼容性的场景下使用新的语法。例如使用箭头函数，在IE10的场景下是不支持的，他可以帮助我们将箭头函数转化成 IE浏览器支持的写法。

对于 const、let 这一类的语法，我们可以通过配置 **@babel/preset-env** 进行转化。

对于 promise 这一类的API，我们可以通过 **babel-polyfill**、**@babel/core-js** 或者 **@babel/runtime-corejs3**

##### 1. 配置

共有三种配置 babel 的方式：

- 在 package.json 中配置 babel 字段
- .babelrc.json 文件，具有不同的扩展名（.babelrc、.js、.cjs、.mjs）
- babel.config.json 文件，具有不同的扩展名（.js、.cjs、.mjs）

如果是项目级配置的话，建议使用第三种形式。

对于行为上报的 SDK 使用的是 babel.config.js

##### 2.  语法转化
@babel/preset-env: 可以帮助我们将新的 js 语法转化为目标浏览器支持的语法, 配置如下：


```js
// babel.config.js 
module.exports = {   
    presets: [     
        [
            '@babel/preset-env', // es6转es5语法
        ],
    ]
};
```
这时候我们就可以使用新的语法在目标浏览器上啦。

Q： 如何查看编译后的结果？

A： 可以通过 **@babel/cli** 进行打包输出


```js
yarn add @babel/cli @babel/preset-env @babel/core -D
```

-   安装 **@babel/cli** - 便于在packages.json的script中使用了babel命令
-   安装 **@babel/preset-env** - 讲新的 js 语法转化为浏览器支持的语法
-   安装 **@babel/core** - babel核心库，必安装

在package.json中添加script命令

```js
"scripts": { 
    "build": "babel core -d dist", // 打包core目录下的js文件，输出到dist目录
},
```

创建一个 core 目录，用于存放行为上报 SDK 的源代码，新建一个js文件，clue-report.js 存放核心代码。如下图所示

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0834f87037204f0197679b774c320b0a~tplv-k3u1fbpfcp-watermark.image?)


```js
// clue-report.js
class ClueReport{}
Promise.resolve();
Array.from();
```
执行 yarn build 我们可以发现


```js
"use strict"; 
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } 
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
var ClueReport = /*#__PURE__*/_createClass(function ClueReport() { 
    _classCallCheck(this, ClueReport);
});
Promise.resolve();
Array.from();
```
编译后的代码中，_classCallCheck 是一个辅助功能实现的工具函数。如果多个文件中都用到了 class，每一个文件编译后都生成一个工具函数，最后就会产生大量重复代码，平白增加文件体积。

而 **plugin-transform-runtime** 就是为了解决这个问题，这个插件会将这些工具函数转换成引入的形式。

因此，执行

```js
yarn add @babel/plugin-transform-runtime -D
```

并在 babel.config.js 中配置


```js
// babel.config.js
module.exports = {
    presets: [
        '@babel/preset-env',
    ], 
    plugins: [ 
        '@babel/plugin-transform-runtime'
    ]
}
```
编译后的结果：

```js
"use strict"; 
var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault"); 
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass")); 
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var ClueReport = /*#__PURE__*/(0, _createClass2["default"])(function ClueReport() { 
    (0, _classCallCheck2["default"])(this, ClueReport);
});
Promise.resolve();
Array.from();
```

从编译的结果我们不难发现，通过 **plugin-transform-runtime** 会通过引入 **@babel/runtime**内的工具函数，所以要安装 **@babel/runtime** 这个依赖包，在项目打包的时候才不会报错。（**babel/runtime并不是开发依赖，而是项目生产依赖。编译时使用了plugin-transform-runtime，你的项目就要依赖于babel/runtime，所以这两个东西是一起使用的**）

因此，我们需要安装 **@babel/runtime** 避免报错

```js
yarn add @babel/runtime -S
```

由编译后的代码，我们还能看出，@babel/preset-env 并不会对 Promise、Array 进行转化，我们需要通过 **@babel/runtime-corejs3**进行转化

##### 3. API 转化

使用 **@babel/plugin-transform-runtime** + **@babel/runtime-corejs3** + **@babel/runtime** 进行 API的转化

因为 @babel/plugin-transform-runtime + @babel/runtime 已经安装过了，此时安装 @babel/runtime-corejs3 即可


```js
yarn add @babel/runtime-corejs3 -D
```

在babel.config.js 添加如下配置

```js
module.exports = {
    presets: [ 
        '@babel/preset-env',
    ], 
    plugins: [
        ['@babel/plugin-transform-runtime', { corejs: 3}]
    ]
}
```
重新执行 yarn build，编译结果如下

```js
"use strict";
var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");
var _promise = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/promise"));
var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from")); var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));
var ClueReport = /*#__PURE__*/(0, _createClass2["default"])(function ClueReport() {
    (0, _classCallCheck2["default"])(this, ClueReport);
});
_promise["default"].resolve();
(0, _from["default"])();
```
*通过编译结果，我们不难看出，@babel/runtime-corejs3 会新增一个变量，用于对 Promise、Array.form 的兼容转化，而且还不会污染原生的Array.form方法。*

##### 结论：

使用 **@babel/preset-env** 可以进行语法转化

对于API的转化，如果我们使用了 Array.form，但是我们的依赖库 B 也定义了这个函数，这时我们全局引入 polyfill 就会出问题：覆盖掉了依赖库 B 的 Array.form。因此用 runtime 就相对安全了他会新增一个变量，在不污染全局Array.form的场景下进行兼容处理。

因此**使用@babel/plugin-transform-runtime + @babel/runtime + @babel/runtime-corejs3 ，目的是为了不影响业务全局的变量或者被影响，适合类库开发**。



| 包名 | 功能 | 说明 |
| --- | --- | --- |
|   @babel/cli      |  命令行执行babel命令工具   |  非必装开发依赖，packages.json的script中使用了babel命令则需安装   |
|   @babel/core     | babel编译核心包          | 必装的开发依赖           |
| @babel/preset-*   | 功能实现插件预设            | 开发依赖，按照需要的功能安装，js语言新特性转换推荐使用preset-env|
| @babel/plugin-transform-runtime | 复用工具函数              | 非必装开发依赖，和@babel/runtime同时存在|
| @babel/runtime | 工具函数库               | 非必装生产依赖，和@babel/plugin-transform-runtime同时存在|
| @babel/runtime-corejs*         | 不污染变量的低版本浏览器兼容库     | 非必装生产依赖，plugin-transform-runtime设置开启后，可以不污染变量的引入polyfill |                         | @babel/polyfill                 | 低版本浏览器兼容库           | 非必装生产依赖，已不推荐使用，推荐通过preset-env的useBuiltIns属性按需引入          |                   
| core-js@*                      | 低版本浏览器兼容库           | 非必装生产依赖，通过preset-env引入polyfill需安装此包，并通过corejs指定版本        |
| babel-loader                    | webpack中使用babel加载文件 | 非必装开发依赖，webpack项目中使用

如果想要进一步了解babel的配置，可以查阅官方文档：

- [ babel 中文文档](https://www.babeljs.cn/docs/)
- [babel 英文文档](https://babeljs.io/docs/en/)

### 打包组件
我们知道 webpack 除了可以打包应用以外，还可以用来打包一些 js 库或者组件库

当然，单纯只是打包 js 库和组件库的话 使用 [rollup](https://www.rollupjs.com/) 打包也是一个不错的选择。因为rollup可以极大程度地去减少代码体积，可以通过 tree-shaking 去抹除无用的代码。

当 rollup无法支持代码分割(splitChunks)等比较高级的特性，基于 SDK 后续的发展考虑，还是选择了功能更加强大的 webpack 进行打包。


```js
npm init -y // 1 初始化 npm 仓库
git init // 2 初始化 git 仓库
yarn add webpack webpack-cli -D // 3 安装webpack依赖
```

创建 **.gitignore** 用来存放不需要提交的文件

```js
// .gitignore
dist/
node_modules/
```
创建 **webpack.config.js**

因为我们需要打包一个js库，支持以下功能：

- 它支持 AMD/CJS/ESM 模块引入
- 支持通过 script 脚本直接引入链接

Q：我们如何将库暴露出去呢？

A：我们需要通过 [output.library](https://webpack.docschina.org/configuration/output/#outputlibrary) 配置项将库暴露出去。

Q：如何支持 AMD/CJS/ESM/ 模块引入 或者 script脚本的形式引入？

A：只需要将  [output.library.type](https://webpack.docschina.org/guides/author-libraries/) 赋值成 umd 即可

因为每次构建都会生成一次js文件，因此我们通过 **clean-webpack-plugin** 清理上一次的构建产物

```js
yarn add clean-webpack-plugin -D
```

根据这些知识储备，我们可以将 webpack.config.js 编写成如下所示：

```js
// webpack.config.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
module.exports = {
  mode: 'production', // 这样可以支持tree-shaking/scope-hosting等特性
  entry: {
    'clue-report': path.resolve(__dirname, './core/clue-report.js'), // 入口文件
  },
  output: {
    filename: '[name].min.js', // 输出的文件
    library: {
      name: 'clueReport', // 暴露出去的库的名称 - library
      type: 'umd', // 支持库引入的方式 - libraryTarget
      export: 'default', // 不添加的话引用的时候需要 clueReport.default
    },
    path: path.resolve(__dirname, 'dist'), // 输出的路径
  },
  plugins: [new CleanWebpackPlugin()], // 清理构建目录
}
```
在package.json脚本下的script添加

```js
"scripts": {
  "build": "webpack"
},
```
当执行 **yarn build**，会对入口文件进行打包，我们可以使用 **babel-loader** 对引入的 js 文件通过 babel 进行转化

```js
yarn add babel-loader -D // 安装babel-loader
```
修改webpack.config.js

```js
// webpack.config.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // webpack5 已经集成，无需安装
module.exports = {
  mode: 'production', // 这样可以支持tree-shaking/scope-hosting等特性
  entry: {
    'clue-report': path.resolve(__dirname, './core/clue-report.js'), // 入口文件
  },
  output: {
    filename: '[name].min.js', // 输出的文件
    library: {
      name: 'clueReport', // 暴露出去的库的名称 - library
      type: 'umd', // 支持库引入的方式 - libraryTarget
      export: 'default', // 不添加的话引用的时候需要 clueReport.default
    },
    path: path.resolve(__dirname, 'dist'), // 输出的路径
  },
  plugins: [new CleanWebpackPlugin()], // 清理构建目录
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'core'),
          // path.resolve(__dirname, "node_modules/regenerator-runtime"),
        ],
        use: [
          'babel-loader', // 用babel-loader对引入的js文件进行babel转化
        ],
      },
    ],
  }
}
```

执行 yarn build 我们可以发现在dist目录上生成了打包后的构建产物

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67029d4b38cd46089c1e173f26ad383b~tplv-k3u1fbpfcp-watermark.image?)


```js
// webpack.config.js - 完整版本
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin'); // webpack5 已经集成，无需安装
module.exports = {
  mode: 'production', // 这样可以支持tree-shaking/scope-hosting等特性
  entry: {
    'clue-report': path.resolve(__dirname, './core/clue-report.js'), // 入口文件
  },
  output: {
    filename: '[name].min.js', // 输出的文件
    library: {
      name: 'clueReport', // 暴露出去的库的名称 - library
      type: 'umd', // 支持库引入的方式 - libraryTarget
      export: 'default', // 不添加的话引用的时候需要 clueReport.default
    },
    path: path.resolve(__dirname, 'dist'), // 输出的路径
  },
  plugins: [new CleanWebpackPlugin()], // 清理构建目录
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'core'),
          // path.resolve(__dirname, "node_modules/regenerator-runtime"),
        ],
        use: [
          'babel-loader', // 用babel-loader对引入的js文件进行babel转化
          'eslint-loader',
        ],
      },
    ],
  }, 
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        extractComments: false, // webpack5：不将注释提取到单独的文件中，这样的话就不会生成LICENSE.text文件了
      }),
    ],
  },
};
```


### 配置 ESLint 和 Prettier
##### 1 Prettier
Prettier 是统一代码风格的工具，使用 Prettier 可以帮助我们很好地管理团队的代码风格

首先，我们需要安装Prettier

```js
yarn add prettier -D
```
然后，创建一个空的配置文件[.prettierrc.json](https://www.prettier.cn/docs/install.html)，让编辑器和其他工具知道您正在使用 Prettier，配置如下：

```js
// .prettierrc.json
{
  "printWidth": 120,
  "tabWidth": 2,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "consistent",
  "trailingComma": "all",
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "proseWrap": "never",
  "endOfLine": "lf"
}
```

接下来，创建一个 [.prettierignore](https://www.prettier.cn/docs/ignore.html) 文件，让 Prettier CLI 和编辑器知道哪些文件不能格式化。下面是一个例子：

```js
// .prettierignore
yarn.lock
dist/
CNAME
LICENSE
netlify.toml
*.sh
*.snap
*.md
.gitignore
.npmignore
.prettierignore
.editorconfig
.eslintignore
**/*.yml
```

借助 [husky 和 lint-staged ](https://www.prettier.cn/docs/install.html#git-hooks)在提交代码时，自动格式化

```js
yarn add  husky lint-staged --dev // 安装依赖
npx husky install
npm set-script prepare "husky install" // 创建 script 下的 prepare 内容为 "husky install" （这里需要 npm >= 7）
npx husky add .husky/pre-commit "npx lint-staged" // 注册钩子，提交前 prettier 格式化一下
```

将以下内容添加到您的 package.json

```js
// package.json
{
  "lint-staged": {
    "**/*.js": [
      "prettier --write",
     "git add", // lint-staged 10 以上就不需要添加这行命令了 https://github.com/okonet/lint-staged/issues/775
    ]
  }
}
```

***注意事项：***

1 执行 npm set-script prepare "husky install" 需要 *npm 的版本大于等于7*

如是7以下的版本，也可以在package.json上添加上script，如下图所示：

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5786111501140c4aaf49fa449f6a842~tplv-k3u1fbpfcp-watermark.image?)


2 当前配置基于husky v5版本，在 2021 年 1 月 27 日，husky 迎来了 v5 的大版本升级，关于husky v4版本与v5版本差异介绍，请看[升级husky5实践 (opens new window)](https://zhuanlan.zhihu.com/p/356924268)

效果如下图所示：


![123.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65901b66f94e4d4fb67694e8ab069f9f~tplv-k3u1fbpfcp-watermark.image?)


除此之外，

我们可以创建 .vscode 工作区配置, 这样的话就无需开发者手动设置了，保存时就会对编写的文件进行格式化

首先我们安装vscode插件 Prettier - Code formatter

其次新建 .vscode 文件夹，在该文件夹内新建一个 settings.json


```js
// settings.json
{
  "editor.tabSize": 2,
  "editor.formatOnSave": true, // 保存自动格式化
  // ===========================================
  // ================ Editor ===================
  // ===========================================
  // ===========================================
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
}
```

效果如下：

![1243.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25d35d2510c847dd87a59966acbf7e6f~tplv-k3u1fbpfcp-watermark.image?)


##### 2 ESLint
[ESLint](https://eslint.org/docs/user-guide/getting-started) 是一种用于检查 ECMAScript/JavaScript 代码中错误的工具，其目标是使代码更加一致并避免错误。

首先安装依赖，创建 .eslintrc.js 作为配置文件

```js
yarn add eslint --dev // 安装依赖
```


```js
// .eslintrc.js
module.exports = {
  "extends": "eslint:recommended" // 配置 eslint 推荐的检验规范
}
```

eslint --fix file.js [file.js] [dir] 格式化/校验语法规范
在 package.json 下的 添加 eslint --fix 用于在提交代码前做一次格式化/校验语法规范的操作

```js

// package.json
"lint-staged": {
  "**/*.js": [
    "prettier --write",
    "eslint --fix"
  ]
}
```

##### 3 兼容 ESLint 和 Prettier
[eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier): 调用 prettier 对代码风格进行检查，将 Prettier 作为 ESLint 规则运行，并将差异报告为单个 ESLint 问题。

[eslint-config-prettier](https://github.com/prettier/eslint-config-prettier): 删除所有不必要的或可能与 Prettier 冲突的规则。

为了兼容 ESLint 和 Prettier 我们使用 eslint-config-prettier 做兼容处理，

为了将 Prettier 作为 ESLint 规则运行，我们使用了 eslint-plugin-prettier，

**eslint-plugin-prettier 与 eslint-config-prettier 也会有兼容问题，因此我们使用 eslint-plugin-prettier 插件附带了一个 plugin:prettier/recommended 配置，可以一次性设置插件和 eslint-config-prettier的兼容规则。**


```js
yarn add eslint-plugin-prettier eslint-config-prettier babel-eslint -D // 安装依赖
```

修改配置

```js
// .eslintrc.js
/**
 * 0 - off - 关闭规则
 * 1 - warn - 规则视为一个警告
 * 2 - error - 错误
 */
module.exports = {
  root: true,
  parser: 'babel-eslint',
  // 配置 eslint-config-prettier 如果同时使用了eslint和prettier发生冲突了，会关闭掉与prettier有冲突的规则，也就是使用prettier认为对的规则
  // eslint-plugin-prettier 插件附带了一个 plugin:prettier/recommended 配置，可以一次性设置插件和 eslint-config-prettier。
  extends: ['eslint:recommended', 'plugin:prettier/recommended'], // https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    parser: 'babel-eslint', // 词法解析器使用babel-eslint，以更好的适配es6的新api
    sourceType: 'module', // 设置"script"（默认）或"module"如果你的代码是在ECMAScript中的模块。
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-control-regex': 'off',
    'no-prototype-builtins': 'off',
    'quotes': ['error', 'single'],
    'comma-dangle': ['error', 'only-multiline'],
    'no-unused-vars': 'off',
    'indent': 'off',
    'prefer-const': 'error',
    'no-case-declarations': 'off',
    'no-irregular-whitespace': ['error', { skipComments: true }], // 允许注释存在空白格
    'prettier/prettier': [
      // "prettier/prettier": "error"，表示被prettier标记的地方抛出错误信息。
      'error',
      {
        endOfLine: 'auto',
      },
    ],
  },
};
```
**注意事项：**

*eslint-plugin-prettier (安装 3.1.3 版本, 避规 ESLint: Error while loading rule 'prettier/prettier': context.getPhysicalFilename is not a function Occurred ) 用来配合 ESLint 检测代码风格。*

*eslint-plugin-prettier需要在 .eslintrc.js 下 rules 配置 - "prettier/prettier": "error"*

##### 4 保存时 eslint 自动格式化
需在vscode上安装**eslint 插件**，然后修改 .vscode 下的settings.json


```js
{
  "editor.tabSize": 2,
  "editor.formatOnSave": true, // 保存自动格式化
  // ===========================================
  // ================ Editor ===================
  // ===========================================
  // ===========================================
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  // "eslint.autoFixOnSave": true, 这个设置被废弃了，使用下面的editor.codeActionsOnSave的配置
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "typescript", "reacttypescript", "reactjavascript", "vue"]
}
```

**5 在webpack中使用eslint**

我们需要引入 **eslint-loader**，在打包的过程中做eslint校验

配置如下:

```js
// webpack.config.js
module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve(__dirname, 'core')],
        use: [
          'babel-loader', // 用babel-loader对引入的js文件进行babel转化
          'eslint-loader',
        ],
      },
    ],
},
```

### 配置 [commintLint](https://commitlint.js.org/#/)

日常开发中由于缺少对于 commit message 的约束，导致填写内容随意、质量参差不齐，可读性低亦难以维护，而书写良好的 commit message 能大大提高代码维护的效率。

出于这个原因，我们可以通过 commintLint 约束 commit message。

##### 1 通过 @commitlint/cli @commitlint/config-conventional 规范提交格式

```js
yarn add @commitlint/cli @commitlint/config-conventional -D // 安装依赖
npx husky add .husky/commit-msg "npx commitlint --edit $1" // 注册钩子，目的是提交代码的时候，去检验提交格式是否符合标准
```

##### 2 创建 commintLint.config.js 配置提交规范

```js
// commintLint.config.js
module.exports = {
    extends: ['@commitlint/config-conventional'],
};
```

这里遵循 Angular 的代码提交规范：

-   feature：新功能
-   fix：修补某功能的bug
-   build: 修改项目构建系统(例如 webpack，cli 的配置等)的提交
-   refactor：重构某个功能
-   style：仅样式改动
-   docs：仅文档新增/改动
-   chore：构建过程或辅助工具的变动
-   ci: 主要目的是修改项目继续集成流程
-   perf: 性能, 体验优化
-   test: 测试某功能、新增测试用例、更新现有测试


```js
// bad
git commit -m ": some message"
git commit -m "fix:"
git commit -m "fix:some message"
git commit -m "FIX: some message"
git commit -m "some message"

// good
git commit -m "fix: some message"

```

只有在遵循代码提交规范的场景下才能提交代码，否则将无法提交，效果如下图所示：
![12443.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81cc03fc611a42a097a0f27d152a1958~tplv-k3u1fbpfcp-watermark.image?)

##### 通过[ standard-version](https://www.npmjs.com/package/standard-version) 生成 changeLog


```js
yarn add standard-version -D // 安装依赖
```

通过 **.versionrc.js** 配置 changeLog

```js
// .versionrc.js
/**
 *
 * 参考文档
 * https://www.npmjs.com/package/standard-version
 *
 */
module.exports = {
  //   skip: {
  //     // bump: true, //缓存变化，并重置git状态至最近的tag节点 true-绕过 默认false
  //     // changelog: true, //自动产出changelog文档 true-绕过 默认false
  //     commit: true, //提交变动 true - 绕过
  //     tag: true, //在git中增加tag标识 true - 绕过
  //   },
  header: '# SDK更新日志 \n\n',
  types: [
    { type: 'feat', section: '✨ Features | 新功能' },
    { type: 'fix', section: '🐛 Bug Fixes | Bug 修复' },
    { type: 'perf', section: '⚡ Performance Improvements | 性能优化' },
    { type: 'revert', section: '⏪ Reverts | 回退' },
    { type: 'chore', section: '📦 Chores | 其他更新' },
    { type: 'docs', section: '📝 Documentation | 文档' },
    { type: 'style', section: '💄 Styles | 风格' },
    { type: 'refactor', section: '♻️ Code Refactoring | 代码重构' },
    { type: 'test', section: '✅ Tests | 测试' },
    { type: 'build', section: '👷‍ Build System | 构建' },
    { type: 'ci', section: '🔧 Continuous Integration | CI 配置' },
  ],
};
```

第一次生成 changeLog 如下命令，做初始化
```js
npx standard-version --first-release // 第一次生成 changeLog 执行
```

也可以在package.json配置如下命令，执行命令不仅会生成 changeLog 还会修改版本号

changelog:major - 软件做了不兼容的变更

changelog:minor - 添加功能或者废弃功能，向下兼容

changelog:patch - bug 修复，向下兼容
```js
{
  "scripts": {
       "changelog:major": "standard-version --release-as major",
       "changelog:minor": "standard-version --release-as minor",
       "changelog:patch": "standard-version --release-as patch",
  }
}
```

### 配置CICD
在 SDK 中配置 CICD 的主要目的是为了在代码提交的场景下，可以自动打包构建到服务器，减少人力成本，提高开发效率。

##### gitlab 中 CI/CD 的基本配置流程
1. 1 注册一台runner机子，填入项目地址和令牌，就可以关联到对应的仓库
2. 2 当你推送代码到远程仓库时，会检查项目下有没有`.gitlab-ci.yml`文件
3. 3 如果存在，会触发hooks在你当前runner机所处的位置，执行yml文件中描述的任务

##### 具体配置流程
###### 1 注册 runner 机子
这里分开windows和linux两种版本，实际业务中都是放在linux服务器，windows版可以自己用来熟悉一下yml的一些命令和ci的代码测试。

- ##### windows版
![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90d0382b167b4901881dfe2a0066b537~tplv-k3u1fbpfcp-watermark.image?)

1 根据系统的是64位或者32位下载runner，下载完之后，把那个.exe文件重命名为，`gitlab-runner.exe`方便后面跟着步骤操作。

2 注册流程
可以从下图中获取到runner的URL以及令牌
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2cb42bb0a731432c84c5627667c18e31~tplv-k3u1fbpfcp-watermark.image?)


- 执行命令 ./gitlab-runner.exe register
- 填入复制的url和令牌
- 填入描述（备注一下机器的用途就行）
- 填入runner的tags，后续执行ci操作的时候会根据这个匹配
- 选择执行脚本的语言，这里选shell，后续有些shell命令相关操作
- 完成注册。这时候目录下会多一个config.toml文件。刷新gitlab后台会看到一台新的注册机子

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2ef79d51e8f04b9bbc72d56a5b1f225c~tplv-k3u1fbpfcp-watermark.image?)

3 启动runner
- `.\gitlab-runner.exe run`，执行完后，刷新gitlab后台可以看到机器的小点变绿色了，代表机器在运行。
- 这时候只要配置了正确的yml文件，后续推送代码的时候，就会触发ci

- ##### windows版
 如果是Ubuntu系统`dpkg -i gitlab-runner_<arch>.deb`，如果是CentOS执行`rpm -i gitlab-runner_<arch>.rpm`
 
开始注册，`sudo gitlab-runner register`

后面的填信息的步骤和windows的是一致的

##### 创建一个.gitlab-ci.yml文件
根据需要配置即可，没什么好说的，这里直接贴代码

```js
stages:
  - deploy

cache:
  paths:
    - node_modules/

# 变量
variables:
  # 源路径
  ORIGIN_DIR: "xxxx" 
  # 目标路径
  TARGET_DIR: "xxxxxx"

deploy:
  # 执行安装依赖的任务
  stage: deploy
  # 这个对应的是刚刚注册的runner的名字，这个非常重要，决定了你是否能启用某个runner机子
  tags:
    - ts-tag
  only:
    # 这个是限制的分支，这里表示只有在develop推送时，才会触发cicd
    refs:
      - develop
    # 这里代表commit的备注中，存在cicd这几个关键词时，才会触发
    variables:
      - $CI_COMMIT_TITLE =~ /cicd/
  # 脚本
  script:
    - cd $ORIGIN_DIR
    - yarn deploy:dev
```

 
### 配置[Jest](https://jestjs.io/zh-Hans/docs/getting-started)

配置 Jest 主要是为了提高代码的健壮性

这里我们通过

### 发布到npm





# 总结
最后，开发一个SDK的成本确实是比较大的，非常感激公司能给到开发SDK的机会。


- 源代码地址：

# 参考文档
强烈建议看官方文档

## 官方文档

1. https://prettier.io/docs/en/install.html - prettier

2. https://www.npmjs.com/package/standard-version - standard-version

3. https://github.com/prettier/eslint-plugin-prettier#options - eslint-plugin-prettier

4. https://github.com/prettier/eslint-config-prettier/ - eslint-config-prettier

5. https://jestjs.io/zh-Hans/docs/api - jest

## 不错的文章
1. https://segmentfault.com/a/1190000040418948 - 配置 prettier 和 commintLint (建议用 yarn 安装 husky, npm 有坑) - https://github.com/typicode/husky/issues/1010

2. https://www.npmjs.com/package/standard-version - 生成 changelog

3. https://juejin.cn/post/6844903877544771592 - 配置 eslint

4. https://juejin.cn/post/6844903621805473800 - 配置 eslint

5. https://juejin.cn/post/7039108357554176037 - 配置 jest

6. https://juejin.cn/post/6844904196244766728 - 编写 jest

7. https://juejin.cn/post/6844903444378025997 - JavaScript设计指南
