/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Alert, Button, message as Message, Popconfirm, Space } from 'antd';
import React, { useRef } from 'react';

import { dict as dictApi } from '@/services/api/system/dict';
import queueLogApi from '@/services/api/system/queueLog';
import { formatJson } from '@/services/common';
import Editor from '@monaco-editor/react';

type ColumnItem = {
  id: number; //60,
  exchange_name: string; //null,
  routing_key_name: string; //null,
  queue_name: string; //null,
  queue_content: string; // null,
  log_content: string; //null,
  produce_status: number; //0,生产状态 1:未生产 2:生产中 3:生产成功 4:生产失败 5:生产重复
  consume_status: number; //0,消费状态 1:未消费 2:消费中 3:消费成功 4:消费失败 5:消费重复
  delay_time: number; //0,
  created_by: number; //0,
  created_at: string; //"2022-11-10 15:59:00",
  updated_at: string; //"2022-12-01 16:01:37",
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '交换机名称',
      dataIndex: 'exchange_name',
    },
    {
      title: '路由名称',
      dataIndex: 'routing_key_name',
    },
    {
      title: '队列名称',
      dataIndex: 'queue_name',
      hideInSearch: true,
    },
    {
      title: '生产状态',
      dataIndex: 'produce_status',
      valueType: 'select',
      request: async () => {
        const msg = await dictApi.getDict('queue_produce_status');
        return msg.data.map((item: any) => ({ label: item.title, value: item.key }));
      },
    },
    {
      title: '消费状态',
      dataIndex: 'consume_status',
      valueType: 'select',
      request: async () => {
        const msg = await dictApi.getDict('queue_consume_status');
        return msg.data.map((item: any) => ({ label: item.title, value: item.key }));
      },
    },
    {
      title: '延迟时间（秒）',
      dataIndex: 'delay_time',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      hideInSearch: true,
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
              title: '队列日志',
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
                  const msg = await queueLogApi.deletes({ ids: selectedRowKeys });
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

          const result = await queueLogApi.getPageList({
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
          defaultCollapsed: false,
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
                message="消息"
                type="info"
                showIcon
                description={
                  <Editor
                    height={200}
                    defaultLanguage="json"
                    defaultValue={formatJson(record.queue_content) as any}
                    options={{
                      readOnly: true,
                      tabSize: 2,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      autoIndent: true,
                      minimap: { enabled: false },
                      folding: true,
                      acceptSuggestionOnCommitCharacter: true,
                      acceptSuggestionOnEnter: true,
                      contextmenu: true,
                    }}
                  />
                }
              />
              <Alert
                message="日志"
                type="warning"
                showIcon
                description={record.log_content}
                style={{ maxHeight: 100, overflow: 'auto' }}
              />
            </Space>
          ),
          rowExpandable: (record) => record.queue_content != null || record.log_content != null,
        }}
      />
    </PageContainer>
  );
};
