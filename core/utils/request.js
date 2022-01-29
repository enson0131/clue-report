/*
 * 请求相关
 * @Author: enson
 * @Date: 2021-12-17 10:07:03
 * @Last Modified by: enson
 * @Last Modified time: 2022-01-07 15:20:18
 */
/**
 * 由于数据的上报属于跨域请求，而 CORS 跨域方案必须要求浏览器支持该协议， 但是 IE 浏览器支持非常不好： XMLHttpRequest 要到 IE >= 10
 * 以上才支持 CORS， IE 8,9 要支持 CORS 只能使用 XDomainRequest 对象。故考虑到 IE 浏览器以及其他众多浏览器的兼容性，数据上报的跨域请求
 * 使用 JSONP 实现。
 *
 * 使用 JSONP 方式发送数据时，由于 P3P 规范限制，IE 浏览器不能存储和发送第三方 Cookie， 换句话说后台设置的 Sesssion ID 无效。
 * 解决方法有： 用户手动设置浏览器的安全级别，或者后台响应中带上 P3P 首部， 如：P3P: CP=”ALL ADM DEV PSAi COM OUR OTRo STP IND ONL”；
 * 由于需要主动上报数据，故只能采用后一种方法.
 * @author enson
 * @date 2021-12-15
 * @export
 * @param {*} url
 * @param {*} data
 */
const env = require('../config/env.js');
export function requset(url, data) {
  url = getRequsetDomain() + url;
  // 构造请求参数串
  let param = '';
  for (const key in data) {
    if (typeof data[key] !== 'undefined') {
      // 过滤掉undefined的值
      param += key + '=' + encodeURIComponent(data[key]) + '&';
    }
  }
  url += '?' + param;

  // 考虑兼容性统一使用 JSONP 发送
  const img = document.createElement('img');
  img.src = url;
  document.getElementsByTagName('head')[0].appendChild(img);
  img.parentNode.removeChild(img);
}

/**
 * @description 跟进环境获取请求域名
 * @author enson
 * @date 2021-12-28
 * @export
 */
export function getRequsetDomain() {
  const domainMap = new Map([
    ['dev', 'http://XXXXX'],
    ['dep', 'http://XXXXX'],
    ['prod', 'https://XXXXXXX'],
  ]);

  return domainMap.get(env) || '';
}
