/*
 * 存放cookie相关的工具
 * @Author: enson
 * @Date: 2021-12-17 10:06:40
 * @Last Modified by:   enson
 * @Last Modified time: 2021-12-17 10:06:40
 */

import { parse, serialize } from 'cookie';

/**
 * @description 根据name获取cookie
 * @author enson
 * @date 2021-12-16
 * @export
 * @param {*} name
 * @returns
 */
export function getCookie(name) {
  return parse(document.cookie)[name] || '';
}

/**
 * @description 设置特定name的cookie
 * @author enson
 * @date 2021-12-16
 * @export
 * @param {*} name
 * @param {*} value
 * @param {*} config
 */
export function setCookie(name, value, config) {
  document.cookie = serialize(name, value, config);
}

/**
 * @description 根据cookie格式字符串设置cookie
 * @author enson
 * @date 2021-12-16
 * @export
 * @param {string} [cookiesString='']
 */
export function setCookieByString(cookiesString = '') {
  const cookies = parse(cookiesString);

  Object.keys(cookies).forEach(name => {
    setCookie(name, cookies[name]);
  });
}
