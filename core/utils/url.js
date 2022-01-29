/**
 * @description 获取 URL 的 Domain
 * @author enson
 * @date 2021-12-16
 * @export
 * @param {*} url
 * @returns
 */
export function getUrlDomain(url) {
  let domain = url.split('/')[2];
  if (domain === void 0) {
    domain = '';
  }
  return domain;
}

// 获取地址里面的参数
export function getUrlParam(url, name) {
  const paramStrings = url.substring(url.indexOf('?') + 1, url.length).split('&');
  let value;
  paramStrings.forEach(str => {
    const tmpKey = decodeURIComponent(str.substring(0, str.indexOf('=')));
    if (tmpKey === name) {
      value = decodeURIComponent(str.substring(str.indexOf('=') + 1, str.length));
      return false;
    }
  });
  return value;
}
