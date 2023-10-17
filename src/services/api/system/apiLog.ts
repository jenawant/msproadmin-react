import { request } from '../../request';

export default {

  /**
   * 获取接口日志分页列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: 'system/logs/getApiLogPageList',
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
      url: 'system/logs/deleteApiLog',
      method: 'delete',
      data
    })
  }
}