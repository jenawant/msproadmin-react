import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { getLocale, history } from '@umijs/max';
import { message, notification } from 'antd';
import { get, isEmpty } from 'lodash';
import env from '../config/env';
import tool from './services/tool';
import { stringify } from 'querystring';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  code: number;
  message: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 统一的请求设定
  timeout: 1000 * 60 * 5,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const {
        success,
        data,
        code,
        message: errorMessage,
        showType,
      } = res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { code, message: errorMessage, showType: showType ?? 0, data, success };
        //throw error; // 禁止抛出自制的错误.EDIT.JENA.20221202
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { message: errorMessage, code: errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        console.error(`Response status:${error.response.status}`);
        // 登录超时
        if (error.response.status === 401) {
          tool.clearToken();
          message.error(error.response.data.message);
          const { search, pathname } = window.location;
          const urlParams = new URL(window.location.href).searchParams;
          /** 此方法会跳转到 redirect 参数所在的位置 */
          const redirect = urlParams.get('redirect');
          // Note: There may be security issues, please note
          if (window.location.pathname !== '/login' && !redirect) {
            history.replace({
              pathname: '/login',
              search: stringify({
                redirect: pathname + search,
              }),
            });
          }
          //history.push('/login');
        } else if (error.response.status === 403) {
          message.error(error.response.data.message);
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      //const env = import.meta.url;
      // console.log(import.meta);
      const token = tool.getToken();
      const configDefault = {
        headers: {
          ...config.headers,
          Authorization: 'Bearer ' + token,
          'Accept-Language': getLocale() ?? 'en-US',
          'Content-Type': get(config, 'headers.Content-Type', 'application/json;charset=UTF-8'),
        },
        baseURL: env.webBaseUrl,
      };
      const option = Object.assign(config, configDefault);

      // json
      if (!isEmpty(option.params)) {
        option.url = option.url + '?' + tool.httpBuild(option.params);
        option.params = {};
      }

      return option;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        //message.error('请求失败！');
      }
      return response;
    },
  ],
};
