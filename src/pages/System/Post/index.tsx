/* eslint-disable no-param-reassign */
import {
  ModalForm,
  PageContainer,
  ProForm,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, message as Message, Popconfirm, Space, Switch, Tooltip } from 'antd';
import { useRef, useState } from 'react';

import postApi from '@/services/api/system/post';
import { PlusOutlined } from '@ant-design/icons';
import {useIntl} from "@@/exports";
import React from 'react';

type ColumnItem = {
  id: number; //1,
  name: string; //"开发岗",
  code: string; //"developer",
  sort: number; //3,
  status: number; //1,
  created_by: number; //1,
  updated_by: number; //1,
  created_at: string; //"2022-11-17 13:07:44",
  updated_at: string; //"2022-11-21 16:54:48",
  remark: string; //"开发人员"
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState(false);
  const intl = useIntl();
  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '岗位名称',
      dataIndex: 'name',
      copyable: false,
      ellipsis: true,
    },
    {
      title: '标识',
      dataIndex: 'code',
      copyable: false,
      ellipsis: true,
    },
    {
      disable: true,
      title: intl.formatMessage({id: 'pages.system.post.status',defaultMessage: '状态',}),
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        1: {
          text: intl.formatMessage({id: 'pages.common.open',defaultMessage: '启用',}),
          status: 'Success',
        },
        2: {
          text: intl.formatMessage({id: 'pages.common.forbiden',defaultMessage: '禁用',}),
          status: 'Error',
        },
      },
      initialValue: undefined,
      hideInTable: true,
    },
    {
      title: intl.formatMessage({id: 'pages.system.post.status',defaultMessage: '状态',}),
      dataIndex: 'status',
      hideInSearch: true,
      render: (text, record) => (
        <Tooltip title={intl.formatMessage({id: 'pages.common.change_status',defaultMessage: '点击变更状态',})}>
          <Switch
            checkedChildren={intl.formatMessage({id: 'pages.common.open',defaultMessage: '启用',})}
            unCheckedChildren={intl.formatMessage({id: 'pages.common.forbiden',defaultMessage: '禁用',})}
            defaultChecked={text === 1}
            size="small"
            onChange={async (checked) => {
              const msg = await postApi.changeStatus({ id: record.id, status: checked ? 1 : 2 });
              if (msg.success) {
                message.success(msg.message);
              } else {
                message.error(msg.message);
              }
            }}
          />
        </Tooltip>
      ),
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      key: 'created_at',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      render: (_: any, record: { created_at: any }) => record.created_at,
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Button
          size="small"
          key="edit"
          type="primary"
          onClick={() => {
            setRow(record);
            setFormVisible(true);
          }}
          shape="round"
        >
          {intl.formatMessage({id: 'pages.common.edit',defaultMessage: '编辑',})}
        </Button>,
        <Popconfirm
          key="popconfirm"
          title={intl.formatMessage({id: 'pages.common.confirm_delete',defaultMessage: '确定要删除吗？',})}
          onConfirm={async () => {
            const result = await postApi.deletes({ ids: [record.id] });
            if (result.success) {
              message.success(result.message);
              actionRef?.current?.reload?.();
            } else {
              message.error(result.message);
            }
          }}
          okText={intl.formatMessage({id: 'pages.common.confirm2',defaultMessage: '确认',})}
          cancelText={intl.formatMessage({id: 'pages.common.cancel',defaultMessage: '取消',})}
        >
          <Button size="small" key="delete" danger shape="round">
            {intl.formatMessage({id: 'pages.common.delete',defaultMessage: '删除',})}
          </Button>
        </Popconfirm>,
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
              title: intl.formatMessage({id: 'pages.system.post.auth',defaultMessage: '权限',}),
            },
            {
              path: '',
              title: intl.formatMessage({id: 'pages.system.post.dept_manage',defaultMessage: '岗位管理',}),
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
            {intl.formatMessage({id: 'pages.common.selected',defaultMessage: '已选'})} {selectedRowKeys.length} {intl.formatMessage({id: 'pages.common.items',defaultMessage: '项'})}
            <Button type="link" style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
              {intl.formatMessage({id: 'pages.common.cancel_selected',defaultMessage: '取消选择'})}
            </Button>
          </span>
        )}
        tableAlertOptionRender={({ selectedRowKeys }) => {
          return (
            <Space size={16}>
              <Popconfirm
                title={intl.formatMessage({id: 'pages.common.confirm_batch_delete',defaultMessage: '确定要批量删除吗？',})}
                onConfirm={async () => {
                  const msg = await postApi.deletes({ ids: selectedRowKeys });
                  if (msg.success) {
                    message.success(msg.message);
                    actionRef.current?.reload?.();
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                <Button type="link">{intl.formatMessage({id: 'pages.common.batch_delete',defaultMessage: '批量删除'})}</Button>
              </Popconfirm>
            </Space>
          );
        }}
        request={async (params = {}, sort) => {
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

          const result = await postApi.getPageList({
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
        toolBarRender={() => [
          <Button
            key="button"
            type="primary"
            shape="round"
            icon={<PlusOutlined />}
            onClick={() => setFormVisible(true)}
          >
            {intl.formatMessage({id: 'pages.common.new',defaultMessage: '新建'})}
          </Button>,
        ]}
      />
      <ModalForm
        title={row ? intl.formatMessage({id: 'pages.common.edit',defaultMessage: '编辑',}) : intl.formatMessage({id: 'pages.common.add2',defaultMessage: '新增',})}
        open={formVisible}
        onOpenChange={(open) => setFormVisible(open)}
        formRef={formRef}
        autoFocusFirstInput
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            setRow(undefined);
            formRef.current?.resetFields();
          },
        }}
        initialValues={row ?? { status: 1, sort: 1 }}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (row) {
            result = await postApi.update(row.id, values);
          } else {
            result = await postApi.save(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success(intl.formatMessage({id: 'pages.common.submit_success',defaultMessage: '提交成功',}));
          formRef.current?.resetFields();
          setRow(undefined);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="name" label={intl.formatMessage({id: 'pages.system.post.name',defaultMessage: '名称',})}
            tooltip={intl.formatMessage({id: 'pages.common.length_limit_24',defaultMessage: '最长为 24 位',})}
            placeholder={intl.formatMessage({id: 'pages.system.post.name_placeholder',defaultMessage: "请输入名称",})}
            rules={[{ required: true, message: intl.formatMessage({id: 'pages.system.post.name_placeholder',defaultMessage: "请输入名称",}) }]}
          />

          <ProFormText
            width="md"
            name="code"
          label={intl.formatMessage({id: 'pages.system.post.code',defaultMessage: '标识',})}
          placeholder={intl.formatMessage({id: 'pages.system.post.code_placeholder',defaultMessage: '请输入标识',})}
            rules={[{ required: true, message: intl.formatMessage({id: 'pages.system.post.code_placeholder',defaultMessage: '请输入标识',}) }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText width="md" name="sort"
          label={intl.formatMessage({id: 'pages.system.post.sort',defaultMessage: '排序',})}
          placeholder={intl.formatMessage({id: 'pages.system.post.sort_placeholder',defaultMessage: '请输入排序',})} />
          <ProFormRadio.Group
            width="md"
            name="status" label={intl.formatMessage({id: 'pages.system.post.status',defaultMessage: '状态',})}
            options={[
              {
                label: intl.formatMessage({id: 'pages.common.open',defaultMessage: '启用',}),
                value: 1,
              },
              {
                label: intl.formatMessage({id: 'pages.common.forbiden',defaultMessage: '禁用',}),
                value: 2,
              },
            ]}
          />
        </ProForm.Group>

        <ProFormTextArea name="remark" label={intl.formatMessage({id: 'pages.system.post.remark',defaultMessage: '备注',})}  />
      </ModalForm>
    </PageContainer>
  );
};
