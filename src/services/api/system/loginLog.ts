import { request } from '../../request';

export default {

  /**
   * 获取登录日志分页列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: 'system/logs/getLoginLogPageList',
      method: 'get',
      params
    })
  },

  /**
   * 删除
   * @returns
   */
  deletes(data: any) {
    return request({
      url: 'system/logs/deleteLoginLog',
      method: 'delete',
      data
    })
  }
}