/**
  前端测试并不是所有项目都必须的，因为写测试代码是需要要花费一定时间的，当项目比较简单的时候，
  花时间写测试代码可能反而会影响开发效率，但是需要指出的是，前端开发过程中，编写测试代码，有以下这些好处：

  1 更快的发现bug，让绝大多数bug在开发阶段发现解决，提高产品质量
  2 比起写注释，单元测试可能是更好的选择，通过运行测试代码，观察输入和输出，有时会比注释更能让别人理解你的代码（当然，重要的注释还是要写的。。。）
  3 有利于重构，如果一个项目的测试代码写的比较完善，重构过程中改动时可以迅速的通过测试代码是否通过来检查重构是否正确，大大提高重构效率
  4 编写测试代码的过程，往往可以让我们深入思考业务流程，让我们的代码写的更完善和规范。

 * 
 * 
 *  */
import clueReport from '../core/clue-report.js';

test('变量a是否为null', () => {
  const a = null
  expect(a).toBeNull()
})

test('变量a是否为undefined', () => {
  const a = undefined
  expect(a).toBeUndefined()
})

test('变量a是否为defined', () => {
  const a = null
  expect(a).toBeDefined()
})

test('变量a是否为true', () => {
  const a = 1
  expect(a).toBeTruthy()
})

test('变量a是否为false', () => {
  const a = 0
  expect(a).toBeFalsy()
})

test('test not', () => {
  const temp = 10
  expect(temp).not.toBe(11)
  expect(temp).not.toBeFalsy()
  expect(temp).toBeTruthy()
})

