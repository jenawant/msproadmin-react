/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Form, message as Message, Popconfirm, Space, Switch } from 'antd';
import React, { useRef, useState } from 'react';

import { dict, dictType } from '@/services/api/system/dict';
import { PlusOutlined } from '@ant-design/icons';
import type { RequestOptionsType } from '@ant-design/pro-utils';
import DataList from '@/pages/System/Dict/dataList';
import { Access, useAccess } from '@umijs/max';

const crud = {
  api: dictType.getTypeList,
  recycleApi: dictType.getRecycleTypeList,
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 240,
  add: { show: true, api: dictType.save, auth: ['system:dict:save'] },
  edit: { show: true, api: dictType.update, auth: ['system:dict:update'] },
  delete: {
    show: true,
    api: dictType.deletes,
    auth: ['system:dict:delete'],
    realApi: dictType.realDelete,
    realAuth: ['system:dict:realDeletes'],
  },
  recovery: { show: true, api: dictType.recoverys, auth: ['system:dict:recovery'] },
  dict: dict.getDict,
};

export type ColumnItem = {
  id: number;
  name: string;
  code: string;
  status: number;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  remark: string; //
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [dataListVisible, setDataListVisible] = useState(false);
  const [row, setRow] = useState<ColumnItem>();
  const [dataStatus, setDataStatus] = useState<RequestOptionsType[]>([]);
  const access = useAccess();
  const changeStatus = async (status: number, id: number) => {
    const response = await dict.changeStatus({ id, status });
    if (response.success) {
      message.success(response.message);
    }
  };

  /**
   * 查询数据字典enum
   */
  const _getDataStatusEnum = async () => {
    const data: RequestOptionsType[] = [];
    if (dataStatus.length == 0) {
      const res = await crud.dict('data_status');
      for (const item of res.data!) {
        data.push({
          label: item.title,
          value: item.key * 1,
        });
      }
      setDataStatus(data);
      return data;
    } else {
      return dataStatus;
    }
  };

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
      hideInTable: true,
    },
    {
      title: '字典名称',
      dataIndex: 'name',
    },
    {
      title: '字典标识',
      dataIndex: 'code',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        return (
          <Switch
            key={record.id}
            disabled={!access.check('system:dataDict:changeStatus')}
            onChange={() => changeStatus(record.status == 1 ? 2 : 1, record.id)}
            defaultChecked={record.status == 1}
            size={'small'}
          />
        );
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      search: false,
      hideInTable: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Access key="edit" accessible={access.check('system:dict:update')}>
          <Button
            className="dropdown-buttons"
            key="permissionGroup"
            type="primary"
            onClick={() => {
              setRow(record);
              setFormVisible(true);
            }}
            size="small"
          >
            编辑
          </Button>
        </Access>,
        <Button
          className="dropdown-buttons"
          key="permissionGroup"
          type="primary"
          onClick={() => {
            setRow(record);
            setDataListVisible(true);
          }}
          size="small"
        >
          数据字典
        </Button>,
        <Access key="popconfirm-del" accessible={access.check('system:dict:delete')}>
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
              title: '数据字典',
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
          // 自定义选择项参考: https://ant.design/components/table-cn/#components-table-demo-row-selection-custom
          // 注释该行则默认不显示下拉选项
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
                  const msg = await crud.delete.api({ ids: selectedRowKeys });
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
          persistenceKey: 'pro-table-singe-demos',
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
          defaultPageSize: 50,
        }}
        dateFormatter="string"
        headerTitle=""
        toolBarRender={() => [
          <Access key="button" accessible={access.check('system:dict:save')}>
            <Button
              key="button"
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => setFormVisible(true)}
            >
              新建
            </Button>
          </Access>,
        ]}
      />
      <ModalForm
        width={500}
        title={row ? '编辑数据字典' : '新增数据字典'}
        open={formVisible}
        onOpenChange={(open) => setFormVisible(open)}
        form={form}
        autoFocusFirstInput
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            setRow(undefined);
            form.resetFields();
          },
        }}
        initialValues={
          row ?? {
            status: 1,
          }
        }
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (row) {
            result = await crud.edit.api(row.id.toString(), values);
          } else {
            result = await crud.add.api(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          form.resetFields();
          setRow(undefined);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormText name="name" label="字典名称" placeholder="请输入字典名称" />
        <ProFormText name="code" label="字典标识" placeholder="请输入字典标识" />
        <ProFormRadio.Group name="status" label="状态" request={_getDataStatusEnum} />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
      <DataList
        onCancel={() => {
          setRow(undefined);
          setDataListVisible(false);
        }}
        dataStatus={dataStatus}
        modalVisible={dataListVisible}
        currentRow={row}
        typeId={row?.id}
      />
    </PageContainer>
  );
};
