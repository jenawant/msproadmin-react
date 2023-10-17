/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Alert, Button, message as Message, Popconfirm, Space, Tag } from 'antd';
import React, { useRef } from 'react';

import apiLogApi from '@/services/api/system/apiLog';
import { formatJson } from '@/services/common';
import Editor from '@monaco-editor/react';

type ColumnItem = {
  id: number; //60,
  api_id: number; //"admin",
  api_name: string; //"DELETE",
  access_name: string; //"/system/logs/deleteLoginLog",
  ip: string; //"172.17.0.1",
  ip_location: string; // "未知",
  request_data: string; //"{\"ids\":[209,208]}",
  response_code: string; //"200",
  response_data: string; //"{\"success\":true,\"message\":\"请求成功\",\"code\":200,\"data\":[]}",
  access_time: string; //"2022-12-02 15:12:47",
  remark: string; //null
};

const statusColorMap = {
  '200': 'green',
  '500': 'red',
};
export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '接口名称',
      dataIndex: 'api_name',
    },
    {
      title: '接口地址',
      dataIndex: 'access_name',
    },
    {
      title: '访问IP',
      dataIndex: 'ip',
      hideInSearch: true,
    },
    {
      title: '访问地点',
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
      title: '访问时间',
      dataIndex: 'access_time',
      valueType: 'dateRange',
      sorter: true,
      defaultSortOrder: 'descend',
      render: (_: any, record: any) => record.access_time,
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
              title: '接口日志',
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
                  const msg = await apiLogApi.deletes({ ids: selectedRowKeys });
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

          const result = await apiLogApi.getPageList({
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
                description={
                  <Editor
                    height={200}
                    defaultLanguage="json"
                    defaultValue={formatJson(record.request_data) as any}
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
                message="响应"
                type="warning"
                showIcon
                description={
                  <Editor
                    height={200}
                    defaultLanguage="json"
                    defaultValue={formatJson(record.response_data) as any}
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
            </Space>
          ),
          rowExpandable: (record) => record.request_data != null || record.response_data != null,
        }}
      />
    </PageContainer>
  );
};
