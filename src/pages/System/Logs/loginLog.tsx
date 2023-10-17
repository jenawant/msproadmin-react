/* eslint-disable no-param-reassign */
import React, { useRef } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message as Message, Popconfirm, Space } from 'antd';

import loginLogApi from '@/services/api/system/loginLog';

type ColumnItem = {
  id: number; //220,
  username: string; //"admin",
  ip: string; //"172.17.0.1",
  ip_location: string; //"未知",
  os: string; //"Windows 10",
  browser: string; //"Chrome",
  status: number; //1,
  message: string; //"登录成功",
  login_time: string; //"2022-12-02 14:59:33",
  remark: string; //null
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '登录账户',
      dataIndex: 'username',
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      valueEnum: {
        2: { text: '失败', status: 'error' },
        1: { text: '成功', status: 'success' },
      },
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
      title: '操作系统',
      dataIndex: 'os',
      hideInSearch: true,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      hideInSearch: true,
    },
    {
      title: '登录信息',
      dataIndex: 'message',
      hideInSearch: true,
    },
    {
      title: '登录时间',
      dataIndex: 'login_time',
      valueType: 'dateRange',
      sorter: true,
      render: (_: any, record: any) => record.login_time,
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
              title: '登录日志',
            },
          ],
        },
      }}
    >
      {contextHolder}
      <ProTable<ColumnItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowSelection={{
          // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
          defaultSelectedRowKeys: [],
        }}
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <span>
            已选 {selectedRowKeys.length} 项
            <Button type="link" style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
              取消选择
            </Button>
          </span>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => {
          return (
            <Space size={16}>
              <Popconfirm
                title="确定要批量删除吗？"
                onConfirm={async () => {
                  const msg = await loginLogApi.deletes({ ids: selectedRowKeys });
                  if (msg.success) {
                    message.success(msg.message);
                    actionRef.current?.reload?.();
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                <Button type="link">批量删除</Button>
              </Popconfirm>
            </Space>
          );
        }}
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

          const result = await loginLogApi.getPageList({
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
      />
    </PageContainer>
  );
};
