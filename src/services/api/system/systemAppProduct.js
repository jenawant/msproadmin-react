import { request } from '@/utils/request.js'

/**
 * 应用绑定产品表 API JS
 */

export default {

  /**
   * 获取应用绑定产品表分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'system/appProduct/index',
      method: 'get',
      params
    })
  },

  /**
   * 添加应用绑定产品表
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'system/appProduct/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新应用绑定产品表数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'system/appProduct/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取应用绑定产品表
   * @returns
   */
  read (data = {}) {
    return request({
      url: 'system/appProduct/read',
      method: 'get',
      data
    })
  },

  /**
   * 将应用绑定产品表删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'system/appProduct/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 从回收站获取应用绑定产品表数据列表
   * @returns
   */
  getRecycleList (params = {}) {
    return request({
      url: 'system/appProduct/recycle',
      method: 'get',
      params
    })
  },

  /**
   * 恢复应用绑定产品表数据
   * @returns
   */
  recoverys (data) {
    return request({
      url: 'system/appProduct/recovery',
      method: 'put',
      data
    })
  },

  /**
   * 真实删除应用绑定产品表
   * @returns
   */
  realDeletes (data) {
    return request({
      url: 'system/appProduct/realDelete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改应用绑定产品表数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'system/appProduct/changeStatus',
      method: 'put',
      data
    })
  },

  /**
   * 修改应用绑定产品表数值数据，自增自减
   * @returns
   */
  numberOperation (data = {}) {
    return request({
      url: 'system/appProduct/numberOperation',
      method: 'put',
      data
    })
  },

  /**
    * 应用绑定产品表导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'system/appProduct/import',
      method: 'post',
      data
    })
  },

  /**
   * 应用绑定产品表下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'system/appProduct/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 应用绑定产品表导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'system/appProduct/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },


}