/* eslint-disable no-param-reassign */
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message as Message, Modal, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import dataMaintain from '@/services/api/system/dataMaintain';
import { KeyOutlined, RiseOutlined } from '@ant-design/icons';

type ColumnItem = {
  name: string; //"country_info",
  engine: string; //"InnoDB",
  version: number; //10,
  row_format: string; //"Dynamic",
  rows: number; //242,
  avg_row_length: number; //67,
  data_length: number; //16384,
  max_data_length: number; //0,
  index_length: number; //0,
  data_free: number; //0,
  auto_increment: number; //243,
  create_time: string; //"2022-12-12 11:21:45",
  update_time: string; //null,
  check_time: string; //null,
  collation: string; //"utf8_general_ci",
  checksum: number; //null,
  create_options: string; //"",
  comment: string; //"国家数据表"
};

type PopColumnItem = {
  column_key: string; //"PRI",
  column_name: string; //"id",
  data_type: string; //"int",
  column_comment: string; //"",
  extra: string; //"auto_increment",
  column_type: string; //"int(11)"
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const [modalVisible, setModalVisible] = useState(false);
  const [table, setTable] = useState<string | undefined>();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '表名称',
      dataIndex: 'name',
    },
    {
      title: '表引擎',
      dataIndex: 'engine',
      hideInSearch: true,
    },

    {
      title: '总行数',
      dataIndex: 'rows',
      hideInSearch: true,
    },
    {
      title: '碎片大小',
      dataIndex: 'data_free',
      hideInSearch: true,
    },
    {
      title: '数据大小',
      dataIndex: 'data_length',
      hideInSearch: true,
    },
    {
      title: '索引大小',
      dataIndex: 'index_length',
      hideInSearch: true,
    },
    {
      title: '字符集',
      dataIndex: 'collation',
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      valueType: 'dateTime',
      hideInSearch: true,
    },
    {
      title: '表注释',
      dataIndex: 'comment',
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record: any) => [
        <Button
          size="small"
          key="edit"
          type="primary"
          onClick={() => {
            setTable(record.name);
            setModalVisible(true);
          }}
          shape="round"
        >
          查看
        </Button>,
      ],
    },
  ];

  const popcolumns: ProColumns<PopColumnItem>[] = [
    {
      title: '字段名称',
      dataIndex: 'column_name',
      render: (text, record) => (
        <Space>
          {record.column_key === 'PRI' || record.extra === 'auto_increment' ? (
            <strong>{text}</strong>
          ) : (
            text
          )}
          {record.column_key === 'PRI' ? (
            <Tooltip title="主键">
              <KeyOutlined style={{ color: 'green' }} />
            </Tooltip>
          ) : null}
          {record.extra === 'auto_increment' ? (
            <Tooltip title="自增">
              <RiseOutlined style={{ color: 'green' }} />
            </Tooltip>
          ) : null}
        </Space>
      ),
    },
    {
      title: '字段类型',
      dataIndex: 'column_type',
    },
    {
      title: '字段注释',
      dataIndex: 'column_comment',
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {
          items: [
            {
              path: '',
              title: '数据',
            },
            {
              path: '',
              title: '数据表维护',
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
              <Button
                type="link"
                onClick={async () => {
                  const msg = await dataMaintain.optimize(selectedRowKeys);
                  if (msg.success) {
                    message.success(msg.message);
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                优化表
              </Button>
              <Button
                type="link"
                onClick={async () => {
                  const msg = await dataMaintain.fragment(selectedRowKeys);
                  if (msg.success) {
                    message.success(msg.message);
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                清理碎片
              </Button>
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

          const result = await dataMaintain.getPageList({
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
        rowKey="name"
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
      <Modal
        title="表结构数据"
        width={800}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={false}
      >
        <ProTable<PopColumnItem>
          columns={popcolumns}
          cardBordered
          params={{ table }}
          request={async (params = {}) => {
            const result = await dataMaintain.getDetailed({
              ...params,
            });
            return {
              data: result.data,
              success: result.success,
            };
          }}
          rowKey="column_name"
          search={false}
          options={{
            density: false,
            setting: false,
          }}
          pagination={false}
        />
      </Modal>
    </PageContainer>
  );
};
