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

import { dict } from '@/services/api/system/dict';
import appGroup from '@/services/api/system/appGroup';
import { PlusOutlined } from '@ant-design/icons';
import type { RequestOptionsType } from '@ant-design/pro-utils';
import { Access, useAccess } from '@umijs/max';

const crud = {
  api: appGroup.getList,
  recycleApi: appGroup.getRecycleList,
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 160,
  add: { show: true, api: appGroup.save, auth: ['system:appGroup:save'] },
  edit: { show: true, api: appGroup.update, auth: ['system:appGroup:update'] },
  delete: {
    show: true,
    api: appGroup.deletes,
    auth: ['system:appGroup:delete'],
    realApi: appGroup.realDeletes,
    realAuth: ['system:appGroup:realDeletes'],
  },
  recovery: { show: true, api: appGroup.recoverys, auth: ['system:appGroup:recovery'] },
  dict: dict.getDict,
};

type ColumnItem = {
  id: number; //主键
  name: string; //应用组名称
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
  const [row, setRow] = useState<ColumnItem>();
  const [dataStatus, setDataStatus] = useState<RequestOptionsType[]>([]);
  const access = useAccess();
  const changeStatus = async (status: number, id: number) => {
    const response = await appGroup.changeStatus({ id, status });
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
      title: '组名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (_, record) => {
        return (
          <Switch
            key={record.id}
            disabled={!access.check('system:appGroup:update')}
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
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Access key="button" accessible={access.check('system:appGroup:update')}>
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
        <Access key="button" accessible={access.check('system:appGroup:delete')}>
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
          <Access key="button" accessible={access.check('system:appGroup:save')}>
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
        width={400}
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
        <ProFormText name="name" label="组名称" placeholder="请输入组名称" />
        <ProFormRadio.Group name="status" label="状态" request={_getDataStatusEnum} />
        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
    </PageContainer>
  );
};
