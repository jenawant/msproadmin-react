import { request } from '@/services/request'

/**
 * 短信任务 API JS
 */

export default {

  /**
   * 获取控制台图表数据
   * @returns
   */
  getChartdata (params = {}) {
    return request({
      url: 'sms/dashboard/chart_data',
      method: 'get',
      params
    })
  },

  /**
   * 获取控制台图表数据ADMIN
   * @returns
   */
  getAdminChartdata (params = {}) {
    return request({
      url: 'sms/dashboard/admin_chart_data',
      method: 'get',
      params
    })
  },
  getPerformance (params = {}) {
    return request({
      url: 'sms/dashboard/performance',
      method: 'get',
      params
    })
  },
  getAdminPerformance (params = {}) {
    return request({
      url: 'sms/dashboard/admin_performance',
      method: 'get',
      params
    })
  },

  getTask (params = {}) {
    return request({
      url: 'sms/dashboard/task',
      method: 'get',
      params
    })
  },
  getAdminTask (params = {}) {
    return request({
      url: 'sms/dashboard/admin_task',
      method: 'get',
      params
    })
  },
  getAdminStatus (params = {}) {
    return request({
      url: 'sms/dashboard/admin_status',
      method: 'get',
      params
    })
  },
  getAdminCountry (params = {}) {
    return request({
      url: 'sms/dashboard/admin_country',
      method: 'get',
      params
    })
  },
  getAdminOperator (params = {}) {
    return request({
      url: 'sms/dashboard/admin_operator',
      method: 'get',
      params
    })
  },
  getAdminSupplier (params = {}) {
    return request({
      url: 'sms/dashboard/admin_supplier',
      method: 'get',
      params
    })
  },
  getAdminSender (params = {}) {
    return request({
      url: 'sms/dashboard/admin_sender',
      method: 'get',
      params
    })
  },
  getAdminMerchantAmount (params = {}) {
    return request({
      url: 'sms/dashboard/admin_merchant_amount',
      method: 'get',
      params
    })
  },
  getAdminSupplierAmount (params = {}) {
    return request({
      url: 'sms/dashboard/admin_supplier_amount',
      method: 'get',
      params
    })
  },
}