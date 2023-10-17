import { request } from '../../request';

export default {

  /**
   * 获取操作日志分页列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: 'system/logs/getOperLogPageList',
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
      url: 'system/logs/deleteOperLog',
      method: 'delete',
      data
    })
  }
}