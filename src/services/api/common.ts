import { request } from '../request';

export default {
  /**
   * 获取用户列表
   * @returns
   */
  getUserList(params = {}) {
    return request({
      url: 'system/common/getUserList',
      method: 'get',
      params,
    });
  },

  /**
   * 通过id 列表获取用户基础信息
   * @returns
   */
  getUserInfoByIds(data = {}) {
    return request({
      url: 'system/common/getUserInfoByIds',
      method: 'post',
      data,
    });
  },

  /**
   * 获取部门列表
   * @returns
   */
  getDeptTreeList(params = {}) {
    return request({
      url: 'system/common/getDeptTreeList',
      method: 'get',
      params,
    });
  },

  /**
   * 获取角色列表
   * @returns
   */
  getRoleList(params = {}) {
    return request({
      url: 'system/common/getRoleList',
      method: 'get',
      params,
    });
  },

  /**
   * 获取岗位列表
   * @returns
   */
  getPostList(params = {}) {
    return request({
      url: 'system/common/getPostList',
      method: 'get',
      params,
    });
  },

  /**
   * 获取公告列表
   * @returns
   */
  getNoticeList(params = {}) {
    return request({
      url: 'system/common/getNoticeList',
      method: 'get',
      params,
    });
  },

  /**
   * 清除所有缓存
   * @returns
   */
  clearAllCache() {
    return request({
      url: 'system/common/clearAllCache',
      method: 'get',
    });
  },

  /**
   * 获取所有文件
   * @returns
   */
  getAllFiles(params = {}) {
    return request({
      url: 'system/getAllFiles',
      method: 'get',
      params,
    });
  },

  /**
   * 上传图片接口
   * EDIT.JENA.20230816
   * @returns
   */
  uploadImage(data: any = {}, isWeb: boolean = false) {
    return request({
      url: isWeb ? 'web/uploadImage' : 'system/uploadImage',
      method: 'post',
      timeout: 30000,
      data,
    });
  },

  /**
   * 上传文件接口
   * @returns
   */
  uploadFile(data: any = {}, isWeb: boolean = false) {
    return request({
      url: isWeb ? 'web/uploadFile' : 'system/uploadFile',
      method: 'post',
      timeout: 30000,
      data,
    });
  },

  /**
   * 分片上传接口
   * @returns
   */
  chunkUpload(data = {}) {
    return request({
      url: 'system/chunkUpload',
      method: 'post',
      timeout: 30000,
      data,
    });
  },

  /**
   * 保存网络图片
   * @returns
   */
  saveNetWorkImage(data = {}) {
    return request({
      url: 'system/saveNetworkImage',
      method: 'post',
      data,
    });
  },

  /**
   * 获取登录日志列表
   */
  getLoginLogList(params = {}) {
    return request({
      url: 'system/common/getLoginLogList',
      method: 'get',
      params,
    });
  },

  /**
   * 获取操作日志列表
   */
  getOperationLogList(params = {}) {
    return request({
      url: 'system/common/getOperationLogList',
      method: 'get',
      params,
    });
  },

  /**
   * 通用导入Excel
   */
  importExcel(url: any, data: any) {
    return request({ url, method: 'post', data, timeout: 30 * 1000 });
  },

  /**
   * 下载通用方法
   */
  download(url: any, method = 'post', params = {}) {
    return request({ url, method, responseType: 'blob', getResponse: true, params });
  },

  /**
   * 快捷查询字典
   */
  getDict(code: string) {
    return request({
      url: 'system/dataDict/list?code=' + code,
      method: 'get',
    });
  },

  /**
   * 快捷查询多个字典
   */
  getDicts(codes: any[]) {
    return request({
      url: 'system/dataDict/lists?codes=' + codes.join(','),
      method: 'get',
    });
  },

  /**
   * 国家列表
   */
  getCountry() {
    return request({
      url: 'country/info/option',
      method: 'get',
    });
  },

  getSummary() {
    return request({
      url: 'system/common/getSummary',
      method: 'get',
    });
  },

  /**
   * 获取模块列表
   */
  getModuleList() {
    return request({
      url: 'setting/common/getModuleList',
      method: 'get',
    });
  },

  downloadById(id: string) {
    return request({
      url: 'system/downloadById?id=' + id,
      method: 'get',
    });
  },

  downloadByHash(hash: string) {
    return request({
      url: 'system/downloadByHash?hash=' + hash,
      method: 'get',
    });
  },

  getFileInfoById(id: string) {
    return request({
      url: 'system/getFileInfoById?id=' + id,
      method: 'get',
    });
  },

  getFileInfoByHash(hash: string) {
    return request({
      url: 'system/getFileInfoByHash?hash=' + hash,
      method: 'get',
    });
  },

  /**
   * 获取模块列表
   */
  getConfig(keys: string) {
    return request({
      url: 'setting/common/getConfig?keys=' + keys,
      method: 'get',
    });
  },

  /**
   * 获取表单信息
   * @param params
   * @returns
   */
  getForm(params = {}) {
    return request({
      url: 'utility/getFormInfo',
      method: 'post',
      params,
    });
  },

  /**
   * 获取WEB表单
   * @param params object
   * @returns object
   */
  getWebForm(params = {}) {
    return request({
      url: 'web/getFormInfo',
      method: 'post',
      params,
    });
  },

  saveWebForm(data = {}) {
    return request({
      url: 'web/saveVerification',
      method: 'post',
      data,
    });
  },

  /**
   * 验证字段
   * @param params
   * @returns
   */
  validateWebField(params = {}) {
    return request({
      url: 'web/validateField',
      method: 'post',
      params,
    });
  },

  /**
   * 验证字段
   * @param params
   * @returns
   */
  validateField(params = {}) {
    return request({
      url: 'utility/validateField',
      method: 'post',
      params,
    });
  },

  /**
   * 获取币种
   * @param params
   * @returns
   */
  getCurrencyList(params = {}) {
    return request({
      url: 'utility/getCurrencyList',
      method: 'get',
      params,
    });
  },

  /**
   * 获取应收金额
   * @param params
   * @returns
   */
  getReceivedAmount(params = {}) {
    return request({
      url: 'utility/getReceivedAmount',
      method: 'get',
      params,
    });
  },

  /**
   * 获取应支付金额
   * @param params
   * @returns
   */
  getChargedAmount(params = {}) {
    return request({
      url: 'utility/getChargedAmount',
      method: 'get',
      params,
    });
  },
};
