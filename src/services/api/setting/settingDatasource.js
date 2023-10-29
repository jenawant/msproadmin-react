import { request } from '@/services/request'

/**
 * 数据源管理 API JS
 */

export default {

  /**
   * 获取数据源管理分页列表
   * @returns
   */
  getList (params = {}) {
    return request({
      url: 'setting/datasource/index',
      method: 'get',
      params
    })
  },

  /**
     * 获取数据源管理选项列表
     * @returns
     */
    getOption (params = {}) {
      return request({
        url: 'setting/datasource/option',
        method: 'get',
        params
      })
    },

  /**
   * 添加数据源管理
   * @returns
   */
  save (data = {}) {
    return request({
      url: 'setting/datasource/save',
      method: 'post',
      data
    })
  },

  /**
   * 更新数据源管理数据
   * @returns
   */
  update (id, data = {}) {
    return request({
      url: 'setting/datasource/update/' + id,
      method: 'put',
      data
    })
  },

  /**
   * 读取数据源管理
   * @returns
   */
  read (id, params = {}) {
    return request({
      url: 'setting/datasource/read/'+id,
      method: 'get',
      params
    })
  },

  /**
   * 将数据源管理删除，有软删除则移动到回收站
   * @returns
   */
  deletes (data) {
    return request({
      url: 'setting/datasource/delete',
      method: 'delete',
      data
    })
  },

  /**
   * 从回收站获取数据源管理数据列表
   * @returns
   */
  getRecycleList (params = {}) {
    return request({
      url: 'setting/datasource/recycle',
      method: 'get',
      params
    })
  },

  /**
   * 恢复数据源管理数据
   * @returns
   */
  recoverys (data) {
    return request({
      url: 'setting/datasource/recovery',
      method: 'put',
      data
    })
  },

  /**
   * 真实删除数据源管理
   * @returns
   */
  realDeletes (data) {
    return request({
      url: 'setting/datasource/realDelete',
      method: 'delete',
      data
    })
  },

  /**
   * 更改数据源管理数据
   * @returns
   */
  changeStatus (data = {}) {
    return request({
      url: 'setting/datasource/changeStatus',
      method: 'put',
      data
    })
  },

  /**
   * 修改数据源管理数值数据，自增自减
   * @returns
   */
  numberOperation (data = {}) {
    return request({
      url: 'setting/datasource/numberOperation',
      method: 'put',
      data
    })
  },

  /**
    * 数据源管理导入
    * @returns
    */
  importExcel (data = {}) {
    return request({
      url: 'setting/datasource/import',
      method: 'post',
      data
    })
  },

  /**
   * 数据源管理下载模板
   * @returns
   */
  downloadTemplate () {
    return request({
      url: 'setting/datasource/downloadTemplate',
      method: 'post',
      responseType: 'blob'
    })
  },

  /**
   * 数据源管理导出
   * @returns
   */
  exportExcel (params = {}) {
    return request({
      url: 'setting/datasource/export',
      method: 'post',
      responseType: 'blob',
      params
    })
  },
  /**
   * 数据源管理异步导出
   * @returns
   */
  asyncExportExcel (params = {}) {
    return request({
      url: 'setting/datasource/asyncExport',
      method: 'post',
      params
    })
  },
  /**
   * 数据源管理下载异步导出的文件
   * @returns
   */
  asyncDownloadExcel (params = {}) {
    return request({
      url: 'setting/datasource/asyncDownload',
      method: 'get',
      responseType: 'blob',
      getResponse: true,
      params
    })
  },

  /**
   * 测试数据库连接
   * @returns
   */
  testLink (data = {}) {
    return request({
      url: 'setting/datasource/testLink',
      method: 'post',
      data
    })
  },

  /**
   * 获取某数据源的表
   * @returns
   */
  getDataSourceTablePageList (params = {}) {
    return request({
      url: 'setting/datasource/getDataSourceTablePageList',
      method: 'get',
      params
    })
  },

}
