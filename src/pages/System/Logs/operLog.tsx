/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import React, { useRef } from 'react';

import operLogApi from '@/services/api/system/operLog';
import { Alert, Space, Tag } from 'antd';

type ColumnItem = {
  id: number; //60,
  username: string; //"admin",
  method: string; //"DELETE",
  router: string; //"/system/logs/deleteLoginLog",
  service_name: string; //"登录日志删除",
  ip: string; //"172.17.0.1",
  ip_location: string; // "未知",
  request_data: string; //"{\"ids\":[209,208]}",
  response_code: string; //"200",
  response_data: string; //"{\"success\":true,\"message\":\"请求成功\",\"code\":200,\"data\":[]}",
  created_by: number; //1,
  updated_by: number; //1,
  created_at: string; //"2022-12-02 15:12:47",
  updated_at: string; //"2022-12-02 15:12:47",
  remark: string; //null
};

const statusColorMap = {
  '200': 'green',
  '500': 'red',
};
export default () => {
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '登录账户',
      dataIndex: 'username',
    },
    {
      title: '业务名称',
      dataIndex: 'service_name',
    },
    {
      title: '路由',
      dataIndex: 'router',
      hideInSearch: true,
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
      hideInSearch: true,
    },
    {
      title: '登录地点',
      dataIndex: 'ip_location',
      hideInSearch: true,
    },

    {
      title: '状态码',
      dataIndex: 'response_code',
      hideInSearch: true,
      render: (dom) => <Tag color={statusColorMap[dom?.toString() ?? '']}>{dom}</Tag>,
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (_: any, record: any) => record.created_at,
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {
          items: [
            {
              path: '',
              title: '监控',
            },
            {
              path: '',
              title: '日志监控',
            },
            {
              path: '',
              title: '操作日志',
            },
          ],
        },
      }}
    >
      <ProTable<ColumnItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params = {}, sort = {}) => {
          // 排序
          let sorts = undefined;
          if (Object.keys(sort).length > 0) {
            sorts = {
              orderBy: Object.keys(sort)[0],
              orderType: Object.values(sort)[0] == 'ascend' ? 'asc' : 'desc',
            };
          }
          // 页码
          params = { page: params.current, ...params };
          delete params.current;

          const result = await operLogApi.getPageList({
            ...params,
            ...sorts,
          });
          return {
            data: result.data.items,
            success: result.success,
            total: result.data.pageInfo.total,
          };
        }}
        columnsState={{
          persistenceKey: window.location.pathname.replaceAll('/', '_'),
          persistenceType: 'localStorage',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        options={{
          density: false,
          setting: {
            listsHeight: 400,
          },
        }}
        pagination={{
          showSizeChanger: true,
          defaultPageSize: 20,
        }}
        dateFormatter="string"
        headerTitle=""
        expandable={{
          expandedRowRender: (record) => (
            <Space className="custom-space-average">
              <Alert
                message="请求"
                type="info"
                showIcon
                description={record.request_data}
                style={{ maxHeight: 100, overflow: 'auto' }}
              />
              <Alert
                message="响应"
                type="warning"
                showIcon
                description={record.response_data}
                style={{ maxHeight: 100, overflow: 'auto' }}
              />
            </Space>
          ),
          rowExpandable: (record) => record.request_data != null || record.response_data != null,
        }}
      />
    </PageContainer>
  );
};
