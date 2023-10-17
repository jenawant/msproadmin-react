import { request } from '../../request';

/**
 * 系统公告 API JS
 */

export default {

  /**
   * 获取系统公告分页列表
   * @returns
   */
  getPageList (params = {}) {
    return request({
      url: 'system/notice/index',
      method: 'get',
      params
    })
  },

  /**
   * 从回收站获取系统公告数据列表
   * @returns
   */
  getRecyclePageList (params = {}) {
    return request({
      url: 'system/notice/recycle',
      method: 'get',
      params
    })
  },

  /**
   * 添加系统公告
   * @returns
   */
  save (params = {}) {
    return request({
      url: 'system/notice/save',
      method: 'post',
      data: params
    })
  },

  /**
   * 读取系统公告
   * @returns
   */
  read (params = {}) {
    return request({
      url: 'system/notice/read',
      method: 'post',
      data: params
    })
  },

  /**
   * 将系统公告移到回收站
   * @returns
   */
  deletes (data: any) {
    return request({
      url: 'system/notice/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 恢复系统公告数据
   * @returns
   */
  recoverys (data: any) {
    return request({
      url: 'system/notice/recovery',
      method: 'put',
      data
    })
  },

  /**
   * 真实删除系统公告
   * @returns
   */
  realDeletes (data: any) {
    return request({
      url: 'system/notice/realDelete',
      method: 'delete',
      data
    })
  },

  /**
   * 更新系统公告数据
   * @returns
   */
  update (id: number, data = {}) {
    return request({
      url: 'system/notice/update/' + id,
      method: 'put',
      data
    })
  }

}