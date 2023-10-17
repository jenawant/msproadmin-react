import { request } from '../../request';

export default {

  /**
   * 获取队列日志分页列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: 'system/logs/getQueueLogPageList',
      method: 'get',
      params
    })
  },

  /**
   * 删除队列日志
   * @returns
   */
  deletes(data: any) {
    return request({
      url: 'system/logs/deleteQueueLog',
      method: 'delete',
      data
    })
  }
}