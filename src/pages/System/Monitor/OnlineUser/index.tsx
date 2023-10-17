/* eslint-disable no-param-reassign */
import React, { useRef } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { LogoutOutlined } from '@ant-design/icons';
import { Button, message as Message, Popconfirm, Space } from 'antd';

import monitorApi from '@/services/api/system/monitor';
import { useAccess, Access } from '@umijs/max';

type ColumnItem = {
  id: number; //1,
  username: string; //"admin",
  password: string; //"$2y$10$kmLd7qVpVV/GSiDV7yJBBuFL6s28jPyR1sE4h4LAxVLwLPgRd6heO",
  user_type: string; //"100",
  nickname: string; //"超级管理员",
  phone: string; //"16858888988",
  email: string; //"admin@adminmine.com",
  avatar: string; //null,
  signed: string; //"广阔天地，大有所为",
  dashboard: string; //"statistics",
  dept_id: number; //1,
  status: number; //1,
  login_ip: string; //"172.17.0.1",
  login_time: string; //"2022-12-01 16:01:37",
  backend_setting: null;
  created_by: number; //0,
  updated_by: number; //1,
  created_at: string; //"2022-11-10 15:59:00",
  updated_at: string; //"2022-12-01 16:01:37",
  remark: string; //null,
  dept: string; //null
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();

  const access = useAccess();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '账户',
      dataIndex: 'username',
      copyable: true,
      ellipsis: true,
    },
    {
      title: '用户昵称',
      dataIndex: 'nickname',
      copyable: true,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '所属部门',
      dataIndex: 'dept',
      hideInSearch: true,
    },
    {
      title: '登录IP',
      dataIndex: 'login_ip',
      hideInSearch: true,
    },
    {
      title: '登录时间',
      dataIndex: 'login_time',
      valueType: 'dateRange',
      sorter: true,
      render: (_: any, record: any) => record.login_time,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Access key="popconfirm-access" accessible={access.check('system:onlineUser:kick')}>
          <Popconfirm
            key="popconfirm"
            title="确定要执行操作吗？"
            onConfirm={async () => {
              const result = await monitorApi.kickUser({ id: [record.id] });
              if (result.success) {
                message.success(result.message);
                actionRef?.current?.reload?.();
              } else {
                message.error(result.message);
              }
            }}
            okText="确认"
            cancelText="取消"
          >
            <Button
              size="small"
              key="delete"
              type="primary"
              icon={<LogoutOutlined />}
              shape="round"
              danger={true}
            >
              强制退出
            </Button>
          </Popconfirm>
        </Access>,
      ],
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
              title: '在线用户',
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
                title="确定要批量退出吗？"
                onConfirm={async () => {
                  const msg = await monitorApi.kickUser({ id: selectedRowKeys });
                  if (msg.success) {
                    message.success(msg.message);
                    actionRef.current?.reload?.();
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                <Button type="link">批量退出</Button>
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

          const result = await monitorApi.getOnlineUserPageList({
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
        // toolBarRender={false}
      />
    </PageContainer>
  );
};
