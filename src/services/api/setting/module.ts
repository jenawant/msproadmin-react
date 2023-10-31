import { request } from "@/services/request";

export default {
  /**
   * 获取本地模块分页列表
   * @returns
   */
  getPageList(params = {}) {
    return request({
      url: "setting/module/index",
      method: "get",
      params,
    });
  },

  /**
   * 创建新模块
   * @returns
   */
  save(data = {}) {
    return request({
      url: "setting/module/save",
      method: "put",
      data,
    });
  },

  /**
   * 删除模块
   * @returns
   */
  deletes(data: any) {
    return request({
      url: "setting/module/delete",
      method: "delete",
      data,
    });
  },

  /**
   * 安装模块
   * @returns
   */
  install(data: any) {
    return request({
      url: "setting/module/install",
      method: "put",
      data,
    });
  },

  /**
   * 启停用模块
   * @returns
   */
  modifyStatus(data = {}) {
    return request({
      url: "setting/module/modifyStatus",
      method: "post",
      data,
    });
  },
};
