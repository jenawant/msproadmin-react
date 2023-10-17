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
import { Button, Form, message as Message, Popconfirm, Space, Switch, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import Bind from '@/pages/System/App/bind';
import app from '@/services/api/system/app';
import appGroup from '@/services/api/system/appGroup';
import { dict } from '@/services/api/system/dict';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import type { RequestOptionsType } from '@ant-design/pro-utils';
import { Access, useAccess } from '@umijs/max';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const crud = {
  api: app.getList,
  recycleApi: app.getRecycleList,
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 270,
  add: { show: true, api: app.save, auth: ['system:app:save'] },
  edit: { show: true, api: app.update, auth: ['system:app:update'] },
  delete: {
    show: true,
    api: app.deletes,
    auth: ['system:app:delete'],
    realApi: app.realDeletes,
    realAuth: ['system:app:realDeletes'],
  },
  recovery: { show: true, api: app.recoverys, auth: ['system:app:recovery'] },
  viewLayoutSetting: {
    layout: 'customer',
    width: '850px',
  },
  dict: dict.getDict,
};

export type ColumnItem = {
  id: number; //主键
  merchant_id: number; //商户ID
  group_id: number; //应用组ID
  app_name: string; //应用名称
  app_id: string; //应用ID
  app_secret: string; //应用密钥
  status: number; //状态
  description: string; //应用介绍
  created_by: number; //创建者
  updated_by: number; //更新者
  created_at: string; //创建时间
  updated_at: string; //更新时间
  deleted_at: string; //删除时间
  remark: string; //备注
  apis?: any[];
  merchant_product?: any[];
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [row, setRow] = useState<ColumnItem>();
  const [dataStatus, setDataStatus] = useState<RequestOptionsType[]>([]);
  const [appGroups, setAppGroups] = useState<RequestOptionsType[]>([]);
  const [bindVisible, setBindVisible] = useState(false);
  const access = useAccess();

  const changeStatus = async (status: number, id: number) => {
    const response = await app.changeStatus({ id, status });
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

  const _getAppGroupsEnum = async () => {
    const data: RequestOptionsType[] = [{ label: '暂无', value: 0 }];
    if (appGroups.length == 0) {
      const res = await appGroup.getSelectList();
      for (const item of res.data!) {
        data.push({
          label: item.name,
          value: item.id,
        });
      }
      setAppGroups(data);
      return data;
    } else {
      return appGroups;
    }
  };

  const _getRow = () => {
    return { ...row };
  };
  const _getAPPId = async () => {
    const res = await app.getAppId();
    return res.data.app_id;
  };
  const _getAppSecret = async () => {
    const res = await app.getAppSecret();
    return res.data.app_secret;
  };

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '应用名称',
      dataIndex: 'app_name',
    },
    {
      title: 'APPID',
      dataIndex: 'app_id',
      copyable: true,
    },
    {
      title: 'APPSECRET',
      dataIndex: 'app_secret',
      search: false,
      ellipsis: true,
      copyable: true,
    },
    {
      title: '所属组',
      dataIndex: 'group_id',
      valueType: 'select',
      request: _getAppGroupsEnum,
      params: { timestamp: Math.random() },
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        return (
          <Switch
            key={record.id}
            disabled={!access.check('system:app:update')}
            onChange={() => changeStatus(record.status == 1 ? 2 : 1, record.id)}
            defaultChecked={record.status == 1}
            size={'small'}
          />
        );
      },
      width:100
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      search: false,
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Access key="edit" accessible={access.check('system:app:update')}>
          <Button
            className="dropdown-buttons"
            key="permissionGroup"
            type="primary"
            onClick={() => {
              setRow(record);
              setFormVisible(true);
            }}
            size="small"
            shape='round'
          >
            编辑
          </Button>
        </Access>,
        <Access key="bind" accessible={access.check('system:app:bind')}>
          <Button
            className="dropdown-buttons"
            key="bind"
            type="default"
            onClick={() => {
              setRow(record);
              setBindVisible(true);
            }}
            size="small"
            shape='round'
          >
            绑定
          </Button>
        </Access>,
        <Access key="delete" accessible={access.check('system:app:delete')}>
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
              title: '权限',
            },
            {
              path: '',
              title: '岗位管理',
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
          const _params = { page: params.current, ...params };
          delete _params.current;

          const result = await crud.api({
            ..._params,
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
          <Access key="button" accessible={access.check('system:app:save')}>
            <Button
              key="button"
              type="primary"
              shape="round"
              icon={<PlusOutlined />}
              onClick={() => {
                setRow(undefined);
                setFormVisible(true);
              }}
            >
              新建
            </Button>
          </Access>,
        ]}
      />
      <ModalForm
        title={row ? '编辑' : '新增'}
        width={500}
        open={formVisible}
        onOpenChange={(open) => {
          // if(row)
          setFormVisible(open);
        }}
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
        request={async () => {
          if (row == undefined) {
            const appId = await _getAPPId();
            const appSecret = await _getAppSecret();
            return { app_id: appId, app_secret: appSecret, group_id: 0, status: 1 };
          } else {
            return _getRow();
          }
          return { ...row };
        }}
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
          setRow(undefined);
          form.resetFields();
          setRow(undefined);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormSelect name="group_id" label="所属组" request={_getAppGroupsEnum} />
        <ProFormText
          name="app_name"
          label="应用名称"
          placeholder="请输入应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        />
        <ProFormText
          name="app_id"
          label="APP ID"
          disabled
          fieldProps={
            !row
              ? {
                  addonAfter: (
                    <Tooltip title="刷新">
                      <SyncOutlined
                        onClick={async () => {
                          form.setFieldValue('app_id', await _getAPPId());
                        }}
                      />
                    </Tooltip>
                  ),
                }
              : undefined
          }
        />
        <ProFormText
          name="app_secret"
          label="APP SECRET"
          disabled
          fieldProps={{
            addonAfter: (
              <Tooltip title="刷新">
                {!row ? (
                  <SyncOutlined
                    onClick={async () => {
                      form.setFieldValue('app_secret', await _getAppSecret());
                    }}
                  />
                ) : (
                  <Popconfirm
                    title="刷新并保存后，会影响该应用的正常调用，是否确定刷新？"
                    onConfirm={async () => {
                      form.setFieldValue('app_secret', await _getAppSecret());
                    }}
                  >
                    <SyncOutlined />
                  </Popconfirm>
                )}
              </Tooltip>
            ),
          }}
        />
        <ProFormText
          name="sms_callback_url"
          label="通知地址"
          placeholder="请输入通知地址"
          rules={[{ type: 'url', message: '请输入正确通知地址' }]}
          extra="配置则启用，通知将以POST形式将数据推送到上述地址"
        />
        <ProFormRadio.Group name="status" label="状态" request={_getDataStatusEnum} />
        <ProFormItem label="应用介绍" name="description">
          <ReactQuill
            theme="snow"
            defaultValue={row?.description ?? '<p><br></p>'}
            onChange={(value) => {
              form.setFieldValue('description', value.replaceAll('<p><br></p>', ''));
            }}
            className="custom-editor"
          />
        </ProFormItem>
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>

      <Bind
        onCancel={() => {
          setBindVisible(false);
        }}
        modalVisible={bindVisible}
        currentRow={row}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};
