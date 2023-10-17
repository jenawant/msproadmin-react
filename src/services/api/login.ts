import { request } from '../request';

export default {
  /**
   * 获取验证码
   * @returns
   */
  getCaptch() {
    return request({
      url: 'system/captcha',
      method: 'get',
    });
  },

  /**
   * 用户登录
   * @param {object} params
   * @returns
   */
  login(params: object = {}) {
    return request({
      url: 'system/login',
      method: 'post',
      data: params,
    });
  },

  /**
   * 用户退出
   * @param {object} params
   * @returns
   */
  logout(params: object = {}) {
    return request({
      url: 'system/logout',
      method: 'post',
      data: params,
    });
  },

  /**
   * 获取登录用户信息
   * @param {object} params
   * @returns
   */
  getInfo(params: object = {}) {
    return request({
      url: 'system/getInfo',
      method: 'get',
      data: params,
    });
  },

  refresh(params: object = {}) {
    return request({
      url: 'system/refresh',
      method: 'post',
      data: params,
    });
  },
};
