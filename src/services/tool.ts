/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-param-reassign */
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import uploadConfig from '../../config/upload';

type ColorType = 'default' | 'primary' | 'success' | 'warning' | 'danger';

const typeColor = (type: ColorType = 'default') => {
  let color = '';
  switch (type) {
    case 'default':
      color = '#35495E';
      break;
    case 'primary':
      color = '#3488ff';
      break;
    case 'success':
      color = '#43B883';
      break;
    case 'warning':
      color = '#e6a23c';
      break;
    case 'danger':
      color = '#f56c6c';
      break;
    default:
      break;
  }
  return color;
};

const tool = {
  /**
   * LocalStorage
   */
  local: {
    set(table: any, settings: any) {
      const _set = JSON.stringify(settings);
      return localStorage.setItem(table, _set);
    },
    get(table: string) {
      let data = localStorage.getItem(table);
      try {
        data = JSON.parse(data as any);
      } catch (err) {
        return null;
      }
      return data;
    },
    remove(table: string) {
      return localStorage.removeItem(table);
    },
    clear() {
      return localStorage.clear();
    },
  },
  /**
   * SessionStorage
   */
  session: {
    set(table: string, settings: any) {
      const _set = JSON.stringify(settings);
      return sessionStorage.setItem(table, _set);
    },
    get(table: string) {
      let data = sessionStorage.getItem(table);
      try {
        data = JSON.parse(data as any);
      } catch (err) {
        return null;
      }
      return data;
    },
    remove(table: string) {
      return sessionStorage.removeItem(table);
    },
    clear() {
      return sessionStorage.clear();
    },
  },
  /**
   * CookieStorage
   */
  cookie: {
    set(name: any, value: string, config = {}) {
      const cfg = {
        expires: null,
        path: null,
        domain: null,
        secure: false,
        httpOnly: false,
        ...config,
      };
      let cookieStr = `${name}=${escape(value)}`;
      if (cfg.expires) {
        const exp = new Date();
        exp.setTime(exp.getTime() + parseInt(cfg.expires) * 1000);
        cookieStr += `;expires=${exp.toString()}`;
      }
      if (cfg.path) {
        cookieStr += `;path=${cfg.path}`;
      }
      if (cfg.domain) {
        cookieStr += `;domain=${cfg.domain}`;
      }
      document.cookie = cookieStr;
    },
    get(name: string) {
      const arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
      if (arr != null) {
        return unescape(arr[2]);
      } else {
        return null;
      }
    },
    remove(name: any) {
      const exp = new Date();
      exp.setTime(exp.getTime() - 1);
      document.cookie = `${name}=;expires=${exp.toString()}`;
    },
  },
  /* Fullscreen */
  screen: (element: {
    requestFullscreen: () => void;
    msRequestFullscreen: () => void;
    mozRequestFullScreen: () => void;
    webkitRequestFullscreen: () => void;
  }) => {
    const isFull = !!document.fullscreenElement;
    if (isFull) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    } else {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    }
  },
  /* 复制对象 */
  objCopy: (obj: any) => {
    return JSON.parse(JSON.stringify(obj));
  },
  /* 日期格式化 */
  dateFormat: (date: string | number | Date, fmt = 'yyyy-MM-dd hh:mm:ss', isDefault = '-') => {
    if (date.toString().length == 10) {
      date = Number(date) * 1000;
    }
    date = new Date(date);

    if (date.valueOf() < 1) {
      return isDefault;
    }
    const o = {
      'M+': date.getMonth() + 1, //月份
      'd+': date.getDate(), //日
      'h+': date.getHours(), //小时
      'm+': date.getMinutes(), //分
      's+': date.getSeconds(), //秒
      'q+': Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length),
        );
      }
    }
    return fmt;
  },
  /* 千分符 */
  groupSeparator: (num: string) => {
    num = num + '';
    if (!num.includes('.')) {
      num += '.';
    }
    return num
      .replace(/(\d)(?=(\d{3})+\.)/g, function ($0: any, $1: string) {
        return $1 + ',';
      })
      .replace(/\.$/, '');
  },
  md5: (str: any) => {
    return CryptoJS.MD5(str).toString();
  },
  base64: {
    encode(data: any) {
      return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(data));
    },
    decode(cipher: any) {
      return CryptoJS.enc.Base64.parse(cipher).toString(CryptoJS.enc.Utf8);
    },
  },
  aes: {
    encode(data: any, secretKey: any) {
      const result = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(secretKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return result.toString();
    },
    decode(cipher: any, secretKey: any) {
      if (!cipher) return false;
      const result = CryptoJS.AES.decrypt(cipher, CryptoJS.enc.Utf8.parse(secretKey), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      return CryptoJS.enc.Utf8.stringify(result);
    },
  },
  rc4: (data: any, keys: string = '') => {
    if (!data) return data;
    const pwd = keys || '1AlGT5wKjF6ywKSWPpAhsuq9Iyr8DNfSDzwFNPBv1X4B3tBU';
    let cipher = '';
    const key = [];
    const box = [];
    const pwd_length = pwd.length;
    const data_length = data.length;
    for (let i = 0; i < 256; i++) {
      key[i] = pwd[i % pwd_length].charCodeAt(0);
      box[i] = i;
    }
    for (let j = 0, i = j; i < 256; i++) {
      j = (j + box[i] + key[i]) % 256;
      const tmp = box[i] as any;
      box[i] = box[j];
      box[j] = tmp;
    }
    for (let a = 0, j = a, i = a; i < data_length; i++) {
      a = (a + 1) % 256;
      j = (j + box[a]) % 256;
      const tmp = box[a] as any;
      box[a] = box[j];
      box[j] = tmp;
      const k = box[(box[a] + box[j]) % 256];
      cipher += String.fromCharCode(data[i].charCodeAt() ^ k);
    }
    return cipher;
  },
  capsule: (title: any, info: any, type: ColorType = 'primary') => {
    console.log(
      `%c ${title} %c ${info} %c`,
      'background:#35495E; padding: 1px; border-radius: 3px 0 0 3px; color: #fff;',
      `background:${typeColor(type)}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff;`,
      'background:transparent',
    );
  },
  formatSize: (size: number) => {
    if (typeof size == 'undefined') {
      return '0';
    }
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let index = 0;
    for (let i = 0; size >= 1024 && i < 5; i++) {
      size /= 1024;
      index = i;
    }
    return Math.round(size) + units[index];
  },
  download: (res: { data: BlobPart; headers: Record<string, string> }, downName = '') => {
    const aLink = document.createElement('a');
    const blob = new Blob([res.data], {
      type: res.headers['content-type'].replace(';charset=utf8', ''),
    });

    let fileName;
    if (!downName) {
      const contentDisposition = decodeURI(res.headers['content-disposition']);
      const result = contentDisposition.match(/filename\*=utf-8\'\'(.+)/gi);
      fileName = result?.[0].replace(/filename\*=utf-8\'\'/gi, '');
    } else {
      fileName = downName;
    }
    aLink.href = URL.createObjectURL(blob);
    // 设置下载文件名称
    aLink.setAttribute('download', fileName ?? '');
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
    URL.revokeObjectURL(aLink.href);
  },
  /**
   * 对象转url参数
   * @param {*} data
   * @param {*} isPrefix
   */
  httpBuild: (data: Record<string, any>, isPrefix: any = false) => {
    const prefix = isPrefix ? '?' : '';
    const _result = [];
    for (const key in data) {
      const value = data[key];
      // 去掉为空的参数
      if (['', undefined, null].includes(value)) {
        continue;
      }
      if (value.constructor === Array) {
        value.forEach((_value) => {
          _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value));
        });
      } else {
        _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }

    return _result.length ? prefix + _result.join('&') : '';
  },
  attachUrl: (path: any, defaultStorage = 'LOCAL') => {
    return path.indexOf('http') === 0 ? path : uploadConfig.storage[defaultStorage] + path;
  },
  /**
   * 设置token，并设置过期时间
   * @param token string
   * @returns
   */
  setToken: (token: string, expired: number = 7195) => {
    tool.local.set('_token_expired_at', dayjs().add(expired, 'second'));
    return tool.local.set('_token', token);
  },
  /**
   * 获取token
   */
  getToken: () => {
    return tool.local.get('_token');
  },
  /**
   * 清理token
   */
  clearToken: () => {
    tool.local.remove('_token');
    tool.local.remove('_token_expired_at');
  },
  /**
   * 获取token过期时间
   * @returns number
   */
  getTokenExpiredAt: () => {
    return tool.local.get('_token_expired_at') ?? dayjs().subtract(10, 'second');
  },
  /**
   * 转Unix时间戳
   */
  toUnixTime: (date: string | number | Date) => {
    return Math.floor(new Date(date).getTime() / 1000);
  },
  arrSum: (arr: any[]) => {
    let sum = 0;
    arr.map((item: number) => (sum += item));
    return sum;
  },
  /**
   * 路由扁平化
   * @param routes any[]
   * @param breadcrumb []
   * @returns any[]
   */
  flatAsyncRoutes: (routes: any[], breadcrumb = []) => {
    const res: any[] = [];
    if (!routes) return res;
    routes?.forEach((route: any) => {
      const tmp = { ...route };
      if (tmp.children) {
        const childrenBreadcrumb = [...breadcrumb] as any;
        childrenBreadcrumb.push(route);
        const tmpRoute = { ...route };
        tmpRoute.meta.breadcrumb = childrenBreadcrumb;
        delete tmpRoute.children;
        res.push(tmpRoute);
        const childrenRoutes = tool.flatAsyncRoutes(tmp.children, childrenBreadcrumb);
        childrenRoutes.map((item) => {
          res.push(item);
        });
      } else {
        const tmpBreadcrumb = [...breadcrumb] as any;
        tmpBreadcrumb.push(tmp);
        tmp.meta.breadcrumb = tmpBreadcrumb;
        res.push(tmp);
      }
    });
    return res;
  },
  UCFirst: (str: string) => {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
  },
  /**
   * 从浏览器获取计算后的色值
   * @param colorStr JSON串
   * @returns
   */
  getChartColorsArray: (colorStr: string) => {
    const colors = JSON.parse(colorStr) as any[];
    return colors.map(function (value: string) {
      const newValue = value.replace(' ', '');
      if (newValue.indexOf(',') === -1) {
        let color = getComputedStyle(document.documentElement).getPropertyValue(newValue);

        if (color.indexOf('#') !== -1) color = color.replace(' ', '');
        if (color) return color;
        else return newValue;
      } else {
        const val = value.split(',');
        if (val.length === 2) {
          let rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = 'rgba(' + rgbaColor + ',' + val[1] + ')';
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  },
  trim: (str: string | number) => {
    //删除左右两端的空格
    return String(str).replace(/(^\s*)|(\s*$)/g, '');
  },
  ltrim: (str: string | number) => {
    //删除左边的空格
    return String(str).replace(/(^\s*)/g, '');
  },
  rtrim: (str: string | number) => {
    //删除右边的空格
    return String(str).replace(/(\s*$)/g, '');
  },
  randomStr: (len: number) => {
    const _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
      min = 0,
      max = _charStr.length - 1;

    let _str = ''; //定义随机字符串 变量
    //判断是否指定长度，否则默认长度为15
    len = len || 15;
    //循环生成字符串
    for (let i = 0, index; i < len; i++) {
      index = (function (randomIndexFunc, i) {
        return randomIndexFunc(min, max, i, randomIndexFunc);
      })(function (
        min: number,
        max: number,
        i: number,
        _self: (arg0: any, arg1: any, arg2: any, arg3: any) => number,
      ) {
        let indexTemp = Math.floor(Math.random() * (max - min + 1) + min);
        const numStart = _charStr.length - 10;
        if (i == 0 && indexTemp >= numStart) {
          indexTemp = _self(min, max, i, _self);
        }
        return indexTemp;
      },
      i);
      _str += _charStr[index];
    }
    return _str;
  },
  // 是否为纯ASCII码字符串
  isASCII: (str: string) => {
    for (let i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 127) {
        return false;
      }
    }
    return true;
  },
};

export default tool;
