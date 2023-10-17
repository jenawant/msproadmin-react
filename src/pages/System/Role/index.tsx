/* eslint-disable no-param-reassign */
import {
  ModalForm,
  PageContainer,
  ProForm,
  ProFormDependency,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, Dropdown, Form, message as Message, Popconfirm, Space, Switch, Tooltip } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useRef, useState } from 'react';

import roleApi from '@/services/api/system/role';
import menuApi from '@/services/api/system/menu';
import deptApi from '@/services/api/system/dept';
import { DatabaseOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import CustomTree from '@/components/CustomTree';

type ColumnItem = {
  id: number; //1,
  name: string; //"超级管理员（创始人）",
  code: string; //"superAdmin",
  data_scope: number; //0,
  status: number; //1,
  sort: number; //0,
  created_by: number; //1,
  updated_by: number; //0,
  created_at: string; //"2022-11-10 15:59:00",
  updated_at: string; //"2022-11-10 15:59:00",
  remark: string; //"系统内置角色，不可删除"
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const menuFormRef = useRef<ProFormInstance>();
  const dataFormRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [menuFormVisible, setMenuFormVisible] = useState<boolean>(false);
  const [dataFormVisible, setDataFormVisible] = useState<boolean>(false);

  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
      copyable: false,
      ellipsis: true,
    },
    {
      title: '角色标识',
      dataIndex: 'code',
      copyable: false,
      ellipsis: true,
    },
    {
      disable: true,
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        1: {
          text: '启用',
          status: 'Success',
        },
        0: {
          text: '禁用',
          status: 'Error',
        },
      },
      initialValue: undefined,
      hideInTable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      render: (text, record) => (
        <Tooltip title="点击变更状态">
          <Switch
            checkedChildren="启用"
            unCheckedChildren="禁用"
            disabled={record.id === 1}
            defaultChecked={text === 1}
            size="small"
            onChange={async (checked) => {
              const msg = await roleApi.changeStatus({ id: record.id, status: checked ? 1 : 2 });
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
      render: (text: any, record: any) =>
        record.id > 1 && [
          <Dropdown.Button
            className="dropdown-buttons"
            key="permissionGroup"
            type="primary"
            menu={{
              items: [
                { key: 'menu', label: '菜单权限', icon: <MenuOutlined /> },
                { key: 'data', label: '数据权限', icon: <DatabaseOutlined /> },
              ],
              onClick: async ({ key }) => {
                setRow(record);
                if (key === 'menu') {
                  const menu = await menuApi.tree();
                  if (menu.success) {
                    setTreeData(menu.data);
                  }
                  const msg = await roleApi.getMenuByRole(record.id);
                  if (msg.success) {
                    setCheckedKeys(msg.data[0].menus.map((item: { id: any }) => item.id));
                  }
                  setMenuFormVisible(true);
                }
                if (key === 'data') {
                  const dept = await deptApi.tree();
                  if (dept.success) {
                    setTreeData(dept.data);
                  }
                  const msg = await roleApi.getDeptByRole(record.id);
                  if (msg.success) {
                    setCheckedKeys(msg.data[0].depts.map((item: { id: any }) => item.id));
                  }
                  setDataFormVisible(true);
                }
              },
            }}
            onClick={() => {
              setRow(record);
              setFormVisible(true);
            }}
            size="small"
          >
            编辑
          </Dropdown.Button>,
          <Popconfirm
            key="popconfirm"
            title="确定要删除吗？"
            onConfirm={async () => {
              const result = await roleApi.deletes({ ids: [record.id] });
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
              title: '权限',
            },
            {
              path: '',
              title: '角色管理',
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
          getCheckboxProps: (record) => ({ disabled: record.id === 1, value: record.id }),
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
                  const msg = await roleApi.deletes({ ids: selectedRowKeys });
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

          const result = await roleApi.getPageList({
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
            新建
          </Button>,
        ]}
      />
      <ModalForm
        title={row ? '编辑' : '新增'}
        open={formVisible}
        onOpenChange={(open) => setFormVisible(open)}
        width={550}
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
            result = await roleApi.update(row.id, values);
          } else {
            result = await roleApi.save(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          formRef.current?.resetFields();
          setRow(undefined);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="名称"
            tooltip="最长为 24 位"
            placeholder="请输入名称"
            rules={[{ required: true, message: '请输入名称' }]}
          />

          <ProFormText
            name="code"
            label="标识"
            placeholder="请输入标识"
            rules={[{ required: true, message: '请输入标识' }]}
          />
        </ProForm.Group>
        <ProForm.Group>
          <ProFormText name="sort" label="排序" placeholder="请输入排序" />
          <ProFormRadio.Group
            name="status"
            label="状态"
            options={[
              {
                label: '启用',
                value: 1,
              },
              {
                label: '禁用',
                value: 2,
              },
            ]}
          />
        </ProForm.Group>

        <ProFormTextArea name="remark" label="备注" />
      </ModalForm>
      <ModalForm
        title="菜单权限"
        layout="horizontal"
        open={menuFormVisible}
        onOpenChange={(open) => setMenuFormVisible(open)}
        width={500}
        formRef={menuFormRef}
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            setRow(undefined);
            menuFormRef.current?.resetFields();
          },
        }}
        initialValues={row}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (!row) {
            return;
          }
          values.menu_ids = checkedKeys;
          result = await roleApi.updateMenuPermission(row.id, values);
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          menuFormRef.current?.resetFields();
          setRow(undefined);
          setMenuFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormText name="name" label="角色名称" disabled={true} />
        <ProFormText name="code" label="角色标识" disabled={true} />
        <Form.Item label="菜单列表">
          <CustomTree
            defaultChecked={checkedKeys}
            originalTreeData={treeData}
            onChecked={(keys) => setCheckedKeys(keys)}
          />
        </Form.Item>
      </ModalForm>
      <ModalForm
        title="数据权限"
        layout="horizontal"
        open={dataFormVisible}
        onOpenChange={(open) => setDataFormVisible(open)}
        width={500}
        formRef={dataFormRef}
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            setRow(undefined);
            dataFormRef.current?.resetFields();
          },
        }}
        initialValues={row}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (!row) {
            return;
          }
          values.dept_ids = checkedKeys;
          result = await roleApi.updateDataPermission(row.id, values);
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          dataFormRef.current?.resetFields();
          setRow(undefined);
          setDataFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormText name="name" label="角色名称" disabled={true} />
        <ProFormText name="code" label="角色标识" disabled={true} />
        <ProFormSelect
          name="data_scope"
          label="数据边界"
          request={async () => [
            { value: 1, label: '全部数据权限' },
            { value: 2, label: '自定义数据权限' },
            { value: 3, label: '本部门数据权限' },
            { value: 4, label: '本部门及以下数据权限' },
            { value: 5, label: '本人数据权限' },
          ]}
          placeholder="请选择"
        />
        <ProFormDependency name={['data_scope']}>
          {({ data_scope }) =>
            data_scope === 2 && (
              <Form.Item label="部门列表">
                <CustomTree
                  defaultChecked={checkedKeys}
                  originalTreeData={treeData}
                  onChecked={(keys) => setCheckedKeys(keys)}
                />
              </Form.Item>
            )
          }
        </ProFormDependency>
      </ModalForm>
    </PageContainer>
  );
};
