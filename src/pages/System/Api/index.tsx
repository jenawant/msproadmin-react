/* eslint-disable no-param-reassign */
import type {
  ActionType,
  ProColumns} from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Dropdown, Form, message as Message, Popconfirm, Space, Switch } from 'antd';
import React, { useRef, useState } from 'react';

import DataList from '@/pages/System/Api/dataList';
import api from '@/services/api/system/api';
import apiGroup from '@/services/api/system/apiGroup';
import { dict } from '@/services/api/system/dict';
import { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import type { RequestOptionsType } from '@ant-design/pro-utils';
import { Access, useAccess } from '@umijs/max';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const crud = {
  api: api.getList,
  recycleApi: api.getRecycleList,
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 260,
  add: { show: true, api: api.save, auth: ['system:api:save'] },
  edit: { show: true, api: api.update, auth: ['system:api:update'] },
  delete: {
    show: true,
    api: api.deletes,
    auth: ['system:api:delete'],
    realApi: api.realDeletes,
    realAuth: ['system:api:realDeletes'],
  },
  recovery: { show: true, api: api.recoverys, auth: ['system:api:recovery'] },
  viewLayoutSetting: {
    layout: 'customer',
    width: '850px',
  },
  dict: dict.getDict,
};

export type ColumnItem = {
  id: number; //主键
  group_id: number; //接口组ID
  name: string; //接口名称
  access_name: string; //接口访问名称
  class_name: string; //类命名空间
  method_name: string; //方法名
  auth_mode: number; //认证模式 (1简易 2复杂)
  request_mode: string; //请求模式 (A 所有 P POST G GET)
  description: string; //接口说明介绍
  response: string; //返回内容示例
  status: number; //状态 (1正常 2停用)
  created_by: number; //创建者
  updated_by: number; //更新者
  created_at: string; //创建时间
  updated_at: string; //更新时间
  deleted_at: string; //删除时间
  remark: string; //备注
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [dataListVisible, setDataListVisible] = useState(false);
  const [row, setRow] = useState<ColumnItem>();
  const [dataStatus, setDataStatus] = useState<RequestOptionsType[]>([]);
  const [requestModes, setRequestModes] = useState<RequestOptionsType[]>([]);
  const [apiDataTypes, setApiDataTypes] = useState<RequestOptionsType[]>([]);
  const [apiGroups, setApiGroups] = useState<RequestOptionsType[]>([]);
  const [currentType, setCurrentType] = useState<string>('request');
  const access = useAccess();

  const changeStatus = async (status: number, id: number) => {
    const response = await api.changeStatus({ id, status });
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
  /**
   * 查询请求模式enum
   */
  const _getRequestModesEnum = async () => {
    const data: RequestOptionsType[] = [];
    const data2: RequestOptionsType[] = [];
    if (requestModes.length == 0) {
      const res = await crud.dict('request_mode');
      for (const item of res.data!) {
        data.push({
          label: item.title,
          value: item.key,
        });
      }
      setRequestModes(data);

      const res2 = await crud.dict('api_data_type');
      for (const item2 of res2.data!) {
        data2.push({
          label: item2.title,
          value: item2.key,
        });
      }
      setApiDataTypes(data2);

      return data;
    } else {
      return requestModes;
    }
  };
  const _getApiGroupsEnum = async () => {
    const data: RequestOptionsType[] = [];
    if (apiGroups.length == 0) {
      const res = await apiGroup.getSelectList();
      for (const item of res.data!) {
        data.push({
          label: item.name,
          value: item.id,
        });
      }
      setApiGroups(data);
      return data;
    } else {
      return apiGroups;
    }
  };

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '所属组',
      dataIndex: 'group_id',
      // search: false,
      valueType: 'select',
      request: _getApiGroupsEnum,
    },
    {
      title: '接口名称',
      dataIndex: 'name',
    },
    {
      title: '访问名称',
      dataIndex: 'access_name',
      search: false,
    },
    {
      title: '请求模式',
      dataIndex: 'request_mode',
      valueType: 'select',
      request: _getRequestModesEnum,
    },
    {
      title: '类名称',
      dataIndex: 'class_name',
      search: false,
    },
    {
      title: '方法名称',
      dataIndex: 'method_name',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        return (
          <Switch
            key={record.id}
            disabled={!access.check('system:api:update')}
            onChange={() => changeStatus(record.status == 1 ? 2 : 1, record.id)}
            defaultChecked={record.status == 1}
            size={'small'}
          />
        );
      },
    },
    {
      title: '认证模式',
      dataIndex: 'auth_mode',
      search: false,
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '简易模式', value: 1 },
          { label: '复杂模式', value: 2 },
        ],
      },
    },

    {
      title: '创建时间',
      dataIndex: 'created_at',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Access key="permissionGroup" accessible={access.check('system:api:update')}>
          <Dropdown.Button
            className="dropdown-buttons"
            key="permissionGroup"
            type="primary"
            menu={{
              items: [
                { key: 'request', label: '入参', icon: <MenuOutlined /> },
                { key: 'response', label: '出参', icon: <MenuOutlined /> },
              ],
              onClick: async (menu) => {
                setRow(record);
                setCurrentType(menu.key);
                setDataListVisible(true);
              },
            }}
            onClick={() => {
              setRow(record);
              setFormVisible(true);
            }}
            size="small"
          >
            编辑
          </Dropdown.Button>
        </Access>,
        <Access key="popconfirm" accessible={access.check('system:api:delete')}>
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
              title: '应用接口',
            },
            {
              path: '',
              title: '接口管理',
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
          defaultPageSize: 20,
        }}
        dateFormatter="string"
        headerTitle=""
        toolBarRender={() => [
          <Access key="button" accessible={access.check('system:api:save')}>
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
        title={row ? '编辑' : '新增'}
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
            result = await crud.edit.api(row.id, values);
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
        <ProFormSelect name="group_id" label="所属组" request={_getApiGroupsEnum} />
        <ProFormText name="name" label="接口名称" placeholder="请输入接口名称" />
        <ProFormText name="access_name" label="访问名称" placeholder="请输入访问名称" />
        <ProFormSelect name="request_mode" label="请求模式" request={_getRequestModesEnum} />
        <ProFormText name="class_name" label="类命名空间" placeholder="请输入类命名空间" />
        <ProFormText name="method_name" label="方法名" placeholder="请输入方法名" />
        <ProFormRadio.Group name="status" label="状态" request={_getDataStatusEnum} />
        <ProFormRadio.Group
          name="auth_mode"
          label="认证模式"
          options={[
            { label: '简易模式', value: 1 },
            { label: '复杂模式', value: 2 },
          ]}
        />
        <ProFormItem
          label="接口介绍"
          name="description"
        >
          <ReactQuill
            theme="snow"
            defaultValue={row?.description ?? '<p><br></p>'}
            onChange={(value) => {
              form.setFieldValue('description', value.replaceAll('<p><br></p>', ''));
            }}
            className="custom-editor"
          />
        </ProFormItem>
        <ProFormTextArea name="response" label="返回示例" />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
      <DataList
        onCancel={() => {
          setDataListVisible(false);
        }}
        dataStatus={dataStatus}
        apiDataTypes={apiDataTypes}
        modalVisible={dataListVisible}
        currentRow={row}
        currentType={currentType}
        typeId={row?.id}
      />
    </PageContainer>
  );
};
