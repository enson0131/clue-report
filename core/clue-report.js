import { getCookie, setCookie } from './utils/cookie.js';
import { getId, getNetWork, getScriptUrl, getDevice } from './utils/tool.js';
import { getUrlParam } from './utils/url.js';
import { requset } from './utils/request.js';
import pkg from '../package.json';

class ClueReport {
  constructor() {
    this.countKey = null;
    this.nowCount = 1; // 当前发送了第几次
    this.startReportTime = 0; // 开始上报时间
    this.endReportTime = 0; // 最后一次上报时间
    this.maxReportTime = 1000 * 60 * 15; // 15分钟
    // config 存放属性
    this.config = {
      script_url: (window && window.CLUEREPORTURL) || 'clue-report', // js的url
      can_report: true, // 是否可以进行上报
      is_hide_page: false, // 页面是否隐藏
      head_id_type: 2,
      id_type: 3, // 参照 FDP 的 pv 实现的 type
      client_id: '', // 访客的唯一标识 - 公共属性
      head_id: '', // 头部Id
      token: '', // 从js的url获取
      version: pkg.version, // npm包的版本号
      cookie_name: '_kht_clue_report', // 需要设置的cookie名称
      content_title: '', // 内容标题 - 存放网页标题 在onload的时候去拿
      content_url: '', // 内容标题 - 存放网页标题 在onload的时候去拿
      client_net: '', // 网络类型
      client_device: '', // 设备型号
      clue_name: '', // 线索名称
      phone: '', // 手机号码
    };
    this.init();
  }
  /**
   * @description 入口
   * @author enson
   * @date 2021-12-16
   * @memberof ClueReport
   */
  init() {
    // 页面初始化后再进行上报
    setTimeout(() => {
      this.run();
    }, 0);
  }
  run() {
    // 初始化参数
    this.initConfig();
    this.behaviorReport(); // 行为上报
    this.httpListener(); // 请求拦截
    this.listenerPage(); // 页面监听
  }
  setConfig(config) {
    Object.assign(this.config, { ...config });
  }
  getConfig(key) {
    if (key) return this.config[key];
    return this.config;
  }
  /**
   * @description  初始化config参数
   * @author enson
   * @date 2021-12-16
   * @memberof ClueReport
   */
  initConfig() {
    const client_id = this.getClientId();
    const token = this.getToken();
    const client_net = getNetWork();
    const client_device = getDevice();
    const { title, URL } = document;

    Object.assign(this.config, {
      client_id,
      token,
      content_title: title,
      content_url: URL,
      client_net,
      head_id: getId(this.config.head_id_type),
      domain: (document && document.domain) || '',
      client_device,
    });
  }
  /**
   * @description 获取clientId
   * @author enson
   * @date 2021-12-17
   * @memberof ClueReport
   */
  getClientId() {
    let clientId = getCookie(this.config.cookie_name);

    if (!clientId) {
      // 如果cookie没有，看下localStorage是否存在
      clientId = localStorage.getItem(this.config.cookie_name);
    }

    // 如果都不存在clientId就生成一个
    if (!clientId) {
      clientId = getId(this.config.id_type);
    }

    localStorage.setItem(this.config.cookie_name, clientId);
    // 重置过期时间
    setCookie(this.config.cookie_name, clientId, {
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    return clientId;
  }
  /**
   * @description 获取token
   * @author enson
   * @date 2021-12-17
   * @memberof ClueReport
   */
  getToken() {
    const currentScriptUrl = getScriptUrl(this.config.script_url);
    return getUrlParam(currentScriptUrl, 'token');
  }
  /**
   * @description 行为上报 - 分成访问行为/操作行为
   * @author enson
   * @date 2021-12-16
   * @memberof ClueReport
   */
  behaviorReport() {
    this.startQueue(this.visitBehaviorReport.bind(this)); // 访问行为上报
  }
  /**
   * @description 访问行为
   * @author enson
   * @date 2021-12-16
   * @memberof ClueReport
   */
  visitBehaviorReport(phone, clueName) {
    const param = {
      cId: this.config.client_id,
      hId: this.config.head_id,
      t: this.config.token,
      // encodeURI方法不会对下列字符编码 ASCII字母 数字 ~!@#$&*()=:/,;?+'
      // encodeURIComponent方法不会对下列字符编码 ASCII字母 数字 ~!*()'
      // 所以encodeURIComponent比encodeURI编码的范围更大。
      qn: (clueName && decodeURIComponent(clueName)) || '',
      p: phone || '',
      d: this.config.domain || '',
      st: 1, // 1-访问行为
      n: this.config.content_title, // 内容标题
      l: this.config.content_url,
      opt: '访问页面',
      cn: this.config.client_net,
      cd: this.config.client_device,
    };
    const url = 'xxxxxx';
    this.clueRequest(url, param);
  }
  /**
   * @description 操作行为
   * @author enson
   * @date 2021-12-16
   * @memberof ClueReport
   */
  // OptBehaviorReport() {
  //   // 如何监听表单提交事件
  // }
  startQueue(callBack) {
    if (!callBack) return;

    if (typeof callBack !== 'function') return;

    if (!this.startReportTime) {
      this.startReportTime = new Date().getTime(); // 设置开始的时间戳
    }
    this.endReportTime = new Date().getTime(); // 设置上报的时间戳

    if (this.endReportTime - this.startReportTime >= this.maxReportTime) {
      this.stopQueue();
      return;
    }

    this.countKey = setTimeout(() => {
      callBack && callBack();
      this.startQueue(callBack);
    }, this.getTime());
  }
  // 结束队列
  stopQueue() {
    clearTimeout(this.countKey);
    this.countKey = null;
    this.nowCount = 1;
  }
  getTime() {
    let time = 0;
    if (this.nowCount <= 5) {
      time = 1 * 1000; //1秒一次
    } else if (this.nowCount > 5 && this.nowCount <= 10) {
      time = 5 * 1000; //5秒一次
    } else if (this.nowCount > 10 && this.nowCount <= 35) {
      time = 10 * 1000; //10秒一次
    } else {
      time = 25 * 1000; //25秒一次
    }
    this.nowCount++;
    return time;
  }
  getPhoneByRequest(data) {
    let phone;
    // 获取手机号
    const phoneReg = /(13[0-9]|15[012356789]|166|17[3678]|18[0-9]|14[57])[0-9]{8}/;
    // 电话号码
    const phoneNumReg = /0\d{2,3}-\d{7,8}/;

    const result = data.match(phoneReg);
    const resultNum = data.match(phoneNumReg);

    if (result && result[0]) {
      phone = result[0];
    }

    if (!phone && resultNum && resultNum[0]) {
      phone = resultNum;
    }

    return phone;
  }
  getUserNameByRequest(data) {
    let clueName;
    // 获取用户信息
    const needUserRegList = ['name', 'nickName', 'userName'];
    const hasUserInfo = needUserRegList.some(item => {
      return data.indexOf(item) > -1;
    });
    if (hasUserInfo) {
      let decodeData = data;
      try {
        decodeData = decodeURIComponent(data);
      } catch (err) {
        console.log(err);
      }
      const targetData = `&${decodeData}&`;
      needUserRegList.some(item => {
        const patt = new RegExp(`${item}"?[=|:]{1}(.*?)([,|&|}])`); // 正则取
        if (patt.test(targetData)) {
          const result = patt.exec(targetData);
          if (result && result[1]) {
            clueName = result[1];
            return true;
          }
        }
        return false;
      });
    }
    if (clueName && typeof clueName === 'string') {
      clueName = clueName.replace(/"/g, '');
    }
    return clueName;
  }
  httpListener() {
    if (window.XMLHttpRequest) {
      const _this = this;
      const oldXmlHttpRequestSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function (_data) {
        // 拦截
        function _preHttpRequestSend() {
          // if (this.readyState == 4) {
          // 判断data是否有用户信息或者手机号，有的话进行上报
          try {
            let phone, clueName;
            if (_data && typeof _data === 'string') {
              phone = _this.getPhoneByRequest(_data);
              clueName = _this.getUserNameByRequest(_data);
            }
            if (phone || clueName) {
              _this.visitBehaviorReport(phone, clueName);
            }
          } catch (err) {
            // 后续方便看报错信息
            // eslint-disable-next-line no-console
            console.log('err', err);
          }
        }
        _preHttpRequestSend();
        oldXmlHttpRequestSend.apply(this, [_data]);
      };
    }
  }
  /**
   * @description 发送请求
   * @author enson
   * @date 2021-12-28
   * @param {*} url
   * @param {*} data
   * @returns
   * @memberof ClueReport
   */
  clueRequest(url, data) {
    if (!this.config.can_report) return;

    if (this.config.is_hide_page) return;
    Object.assign(data, {
      version: this.config.version,
    });
    requset(url, data);
  }
  /**
   * @description 监听页面
   * @author enson
   * @date 2021-12-28
   * @memberof ClueReport
   */
  listenerPage() {
    this.visibilityChange(); // 页面监听
  }
  /**
   * @description 监听页面是否隐藏，如果隐藏则不上报
   * @author enson
   * @date 2021-12-28
   * @returns
   * @memberof ClueReport
   */
  visibilityChange() {
    // 设置隐藏属性和改变可见属性的事件的名称
    let hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    if (!visibilityChange) return;

    if (document.addEventListener) {
      document.addEventListener(visibilityChange, () => {
        this.config.is_hide_page = document[hidden];
      });
    } else if (document.attachEvent) {
      document.attachEvent('on' + visibilityChange, function () {
        this.config.is_hide_page = document[hidden];
      });
    }
  }
}

const clueReport = new ClueReport();
export default clueReport;
