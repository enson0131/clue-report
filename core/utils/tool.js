/*
 * 生成id
 *
 * 生成规则：类型（1字节） + 时间戳（4字节） + 随机数（3字节）
 * 由于 JS 中不支持全 64 bit 的整数， 故采用分段拼接的方式
 */
export function getId(idType) {
  // part1
  let part1 = idType.toString(16);
  if (part1.length < 2) {
    for (let bit = 0; bit < 2 - part1.length; bit++) {
      part1 = '0' + part1;
    }
  }

  // part 2
  let part2 = ((new Date().getTime() & 0xffffffff) >>> 0).toString(16);
  if (part2.length < 8) {
    for (let bit = 0; bit < 8 - part2.length; bit++) {
      part2 = '0' + part2;
    }
  }

  // part3
  const max = 0xffffff;
  let part3 = ((Math.random() * max) & 0xffffff).toString(16);
  if (part3.length < 6) {
    for (let bit = 0; bit < 6 - part3.length; bit++) {
      part3 = '0' + part3;
    }
  }

  return part1 + part2 + part3;
}

/**
 * @description 根据关键字匹配获取到的 scriptUrl
 * @author enson
 * @date 2021-12-15
 * @export
 */
export function getScriptUrl(keyWord) {
  const scripts = document.getElementsByTagName('script');
  for (let i = 0; i < scripts.length; i++) {
    const script = scripts[i];
    if (script && script.getAttribute('src') && script.getAttribute('src').indexOf(keyWord) > -1) {
      return script.getAttribute('src');
    }
  }
}

/**
 * @description 判断是否是手机号
 * @author enson
 * @date 2021-12-16
 * @export
 * @param {*} phoneNumber
 * @returns
 */
export function checkPhoneNumber(phoneNumber) {
  const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}$/;
  return reg.test(phoneNumber);
}

/**
 * @description 获取网络设备
 * @author enson
 * @date 2021-12-16
 * @export
 * @returns
 */
export function getNetWork() {
  let effectiveType = '';
  const connection = window.navigator.connection || window.navigator.mozConnection || window.navigator.webkitConnection;
  if (connection) {
    if (connection.type === 'wifi' || connection.type === 'ethernet') {
      effectiveType = connection.type;
    } else {
      effectiveType = connection.effectiveType;
    }
  }

  return effectiveType;
}

/**
 * @description 转换 dict 到 json 字符串, 当低版本浏览器不支持 JSON.stringify() 时使用
 * @author enson
 * @date 2021-12-16
 * @export
 */
export function json_stringify() {
  const toString = Object.prototype.toString;
  const isArray =
    Array.isArray ||
    function (a) {
      return toString.call(a) === '[object Array]';
    };
  const escMap = { '"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t' };
  const escFunc = function (m) {
    return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1);
  };
  const escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
  return function stringify(value) {
    if (value == null) {
      return 'null';
    } else if (typeof value === 'number') {
      return isFinite(value) ? value.toString() : 'null';
    } else if (typeof value === 'boolean') {
      return value.toString();
    } else if (typeof value === 'object') {
      if (typeof value.toJSON === 'function') {
        return stringify(value.toJSON());
      } else if (isArray(value)) {
        var res = '[';
        for (var i = 0; i < value.length; i++) res += (i ? ', ' : '') + stringify(value[i]);
        return res + ']';
      } else if (toString.call(value) === '[object Object]') {
        var tmp = [];
        for (var k in value) {
          if (value.hasOwnProperty(k)) tmp.push(stringify(k) + ': ' + stringify(value[k]));
        }
        return '{' + tmp.join(', ') + '}';
      }
    }
    return '"' + value.toString().replace(escRE, escFunc) + '"';
  };
}

/**
 * @description 获取设备型号
 * @author enson
 * @date 2021-12-22
 * @export
 */
export function getDevice() {
  let device;
  const agent = window && window.navigator.userAgent.toLowerCase();

  if (agent) {
    if (/windows/.test(agent)) {
      device = 'windows';
    } else if (/iphone|ipod/.test(agent) && /mobile/.test(agent)) {
      device = 'iphone';
    } else if (/ipad/.test(agent) && /mobile/.test(agent)) {
      device = 'ipad';
    } else if (/android/.test(agent) && /mobile/.test(agent)) {
      device = 'android';
    } else if (/linux/.test(agent)) {
      device = 'linux';
    } else if (/mac/.test(agent)) {
      device = 'mac';
    }
  }

  return device;
}
