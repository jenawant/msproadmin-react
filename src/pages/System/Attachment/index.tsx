/* eslint-disable no-param-reassign */
import commonApi from '@/services/api/common';
import attachment from '@/services/api/system/attachment';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message as Message, Popconfirm, Space } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useEffect, useRef, useState } from 'react';

import CustomTree from '@/components/CustomTree';
import tool from '@/services/tool';
import { Access, useAccess } from '@umijs/max';

import not_image from '@/../public/images/not-image.png';

const getStoreMode = (mode: number) => {
  switch (mode) {
    case 1:
      return 'LOCAL';
    case 2:
      return 'OSS';
    case 3:
      return 'COS';
    case 4:
      return 'QINIU';
  }
  return 'LOCAL';
};

type ColumnItem = {
  id: number; //主键
  storage_mode: number; //存储模式
  origin_name: string; //原文件名
  object_name: string; //新文件名
  hash: string; //文件hash
  mime_type: string; //资源类型
  storage_path: string; //存储目录
  suffix: string; //文件后缀
  size_byte: number; //字节数
  size_info: string; //文件大小
  url: string; //url地址
  created_by: number; //创建者
  updated_by: number; //更新者
  created_at: string; //创建时间
  updated_at: string; //更新时间
  deleted_at: string; //删除时间
  remark: string; //备注
};

const crud = {
  api: attachment.getPageList,
  recycleApi: attachment.getRecyclePageList,
  requestParams: {},
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 200,
  delete: {
    show: true,
    api: attachment.deletes,
    auth: ['system:attachment:delete'],
    realApi: attachment.realDeletes,
    realAuth: ['system:attachment:realDeletes'],
  },
  recovery: { show: true, api: attachment.recoverys, auth: ['system:attachment:recovery'] },
  isDbClickEdit: false,
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();

  const [deptTreeData, setDeptTreeData] = useState<DataNode[]>([]);
  const [mimeType, setMimeType] = useState<string>('');
  const access = useAccess();

  useEffect(() => {
    const fetch = async () => {
      const treeData = await commonApi.getDict('attachment_type');
      if (treeData.success) {
        treeData.data.map((item: any) => (item.label = item.title));
        setDeptTreeData([{ id: 0, label: '所有' }, ...treeData.data]);
      }
    };
    fetch();
    return () => {
      setDeptTreeData([]);
    };
  }, []);

  const download = async (record: ColumnItem) => {
    message.info('请求服务器下载文件中...');
    const url = 'system/downloadById?id=' + record.id;
    const response = await commonApi.download(url, 'get');
    if (response) {
      tool.download(response);
      message.success('请求成功，文件开始下载');
    } else {
      message.error('文件下载失败');
    }
  };

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '预览',
      dataIndex: 'url',
      search: false,
      valueType: 'image',
      renderText: (url, record) =>
        /image/g.test(record.mime_type)
          ? tool.attachUrl(record.url, getStoreMode(record.storage_mode))
          : not_image,
      width: 80,
    },
    {
      title: '存储名称',
      dataIndex: 'object_name',
      search: false,
      ellipsis: true,
    },
    {
      title: '原文件名',
      dataIndex: 'origin_name',
      ellipsis: true,
    },
    {
      title: '存储模式',
      dataIndex: 'storage_mode',
      valueType: 'select',
      request: async () => {
        const result = await commonApi.getDict('upload_mode');
        return result.data.map((item: any) => ({ label: item.title, value: item.key }));
      },
    },
    {
      title: '资源类型',
      dataIndex: 'mime_type',
      search: false,
    },
    {
      title: '存储目录',
      dataIndex: 'storage_path',
      search: false,
    },
    {
      title: '文件大小',
      dataIndex: 'size_info',
      search: false,
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      sorter: true,
      defaultSortOrder: 'descend',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Button
          className="dropdown-buttons"
          key="permissionGroup"
          type="primary"
          onClick={() => {
            download(record);
          }}
          size="small"
        >
          下载
        </Button>,
        <Access key="button" accessible={access.check('system:attachment:delete')}>
          <Popconfirm
            key="popconfirm"
            title="确定要删除吗？"
            onConfirm={async () => {
              const result = await crud.delete.api({ ids: [record.id] });
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
            <Button size="small" key="delete" danger shape="round">
              删除
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
              title: '数据',
            },
            {
              path: '',
              title: '附件管理',
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
                  const msg = await attachment.deletes({ ids: selectedRowKeys });
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
        params={{ mime_type: mimeType }}
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

          const result = await crud.api({
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
        toolBarRender={() => []}
        tableRender={(_, dom) => (
          <Space align="start">
            <CustomTree
              showToolbar={false}
              originalTreeData={deptTreeData}
              defaultSelected={[0]}
              checkable={false}
              onSelected={(keys) => {
                // @ts-ignore
                setMimeType(deptTreeData.find((item) => item.id == keys[0])?.key);
              }}
            />
            {dom}
          </Space>
        )}
      />
    </PageContainer>
  );
};
