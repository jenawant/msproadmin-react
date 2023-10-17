/* eslint-disable no-param-reassign */
import {
  DrawerForm,
  PageContainer,
  ProFormDependency,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, Card, Drawer, message as Message, Popconfirm, Space, Switch, Tag, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import menuApi from '@/services/api/system/menu';
import {
  ArrowsAltOutlined,
  EllipsisOutlined,
  PlusOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import IconMap from '@/../config/icons';

type ColumnItem = {
  id: number; //1100,
  parent_id: number; //1000,
  level: string; //"0,1000",
  name: string; //"用户管理",
  code: string; //"system:user",
  icon: string; //"ma-icon-user",
  route: string; //"user",
  component: string; //"system/user/index",
  redirect: string; //null,
  is_hidden: number; //2,
  type: string; //"M",
  status: number; //1,
  sort: number; //99,
  created_by: string; //null,
  updated_by: string; //null,
  created_at: string; //"2021-07-25 18:50:15",
  updated_at: string; //"2021-07-25 18:50:15",
  remark: null;
  children: ColumnItem[];
};

const types = [
  {
    key: 'M',
    val: (
      <Tag title="菜单" color="#f50">
        菜单
      </Tag>
    ),
  },
  {
    key: 'B',
    val: (
      <Tag title="按钮" color="#2db7f5">
        按钮
      </Tag>
    ),
  },
];

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [parentId, setParentId] = useState<number>(0);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [expandall, setExpandall] = useState<boolean>(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [menuData, setMenuData] = useState<ColumnItem[]>([]);

  const [showIcons, setShowIcons] = useState(false);
  const [menuIcon, setMenuIcon] = useState(<EllipsisOutlined />);

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 300,
    },
    {
      title: '菜单类型',
      dataIndex: 'type',
      hideInSearch: true,
      render: (text) => types.find((type) => type.key === text)?.val,
    },
    {
      title: '图标',
      dataIndex: 'icon',
      hideInSearch: true,
      render: (text) => IconMap[text as string],
    },
    {
      title: '菜单标识',
      dataIndex: 'code',
    },
    {
      title: '路由地址',
      dataIndex: 'route',
      hideInSearch: true,
    },
    {
      title: '视图组件',
      dataIndex: 'component',
      hideInSearch: true,
    },
    {
      title: '排序',
      key: 'sort',
      dataIndex: 'sort',
      hideInSearch: true,
    },
    {
      disable: true,
      title: '状态',
      dataIndex: 'status',
      filters: false,
      onFilter: true,
      ellipsis: true,
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
            defaultChecked={text === 1}
            size="small"
            onChange={async (checked) => {
              const msg = await menuApi.changeStatus({ id: record.id, status: checked ? 1 : 2 });
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
      title: '操作',
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 250,
      render: (text: any, record: any) => [
        record.type !== 'B' && (
          <Button
            size="small"
            key="add"
            type="primary"
            onClick={() => {
              setRow(undefined);
              setParentId(record.id);
              setFormVisible(true);
            }}
            shape="round"
          >
            新增
          </Button>
        ),
        <Button
          size="small"
          key="edit"
          type="default"
          onClick={() => {
            setRow(record);
            setFormVisible(true);
          }}
          shape="round"
        >
          编辑
        </Button>,
        <Popconfirm
          key="popconfirm"
          title="确定要删除吗？"
          onConfirm={async () => {
            const result = await menuApi.deletes({ ids: [record.id] });
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

  const rebuildMenu = (menus: any[]): any[] =>
    menus
      ?.filter((menu) => menu.type === 'M')
      ?.map((menu) => ({
        title: menu.name,
        value: menu.id,
        children: rebuildMenu(menu.children),
      }));

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
              title: '菜单管理',
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
                  const msg = await menuApi.deletes({ ids: selectedRowKeys });
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

          const result = await menuApi.getList({
            ...params,
            ...sorts,
          });
          setMenuData(result.data);
          return {
            data: result.data,
            success: result.success,
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
        pagination={false}
        dateFormatter="string"
        headerTitle={
          <Button
            type="default"
            shape="round"
            icon={expandall ? <ShrinkOutlined /> : <ArrowsAltOutlined />}
            onClick={() => {
              if (!expandall) {
                setExpandedRowKeys(menuData.map((menu) => menu.id));
              } else {
                setExpandedRowKeys([]);
              }
              setExpandall(!expandall);
            }}
          >
            {expandall ? '折叠' : '展开'}
          </Button>
        }
        expandedRowKeys={expandedRowKeys}
        expandable={{
          onExpand: (expanded, record) => {
            if (expanded) {
              setExpandedRowKeys([...expandedRowKeys, record.id]);
            } else {
              setExpandedRowKeys([...expandedRowKeys.filter((key) => key !== record.id)]);
            }
          },
        }}
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
        scroll={{ x: 1500 }}
      />
      <DrawerForm
        title={row ? '编辑' : '新增'}
        width={500}
        layout="horizontal"
        labelCol={{ span: 5 }}
        open={formVisible}
        onOpenChange={(open) => setFormVisible(open)}
        formRef={formRef}
        autoFocusFirstInput
        drawerProps={{
          maskClosable: false,
          destroyOnClose: true,
          onClose: () => {
            setRow(undefined);
            setParentId(0);
            setMenuIcon(<EllipsisOutlined />);
            formRef.current?.resetFields();
          },
        }}
        initialValues={
          row ?? {
            parent_id: parentId,
            type: 'M',
            sort: 1,
            is_hidden: 2,
            restful: 2,
            status: 1,
          }
        }
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (row) {
            result = await menuApi.update(row.id, values);
          } else {
            result = await menuApi.save(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          formRef.current?.resetFields();
          setRow(undefined);
          setParentId(0);
          setMenuIcon(<EllipsisOutlined />);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormTreeSelect
          name="parent_id"
          label="上级菜单"
          placeholder="请选择"
          fieldProps={{
            treeDefaultExpandAll: true,
          }}
          request={async () =>
            rebuildMenu([{ id: 0, name: '顶级菜单', type: 'M', children: [] }, ...menuData])
          }
        />
        <ProFormText
          name="name"
          label="名称"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
          rules={[{ required: true, message: '请输入名称' }]}
        />
        <ProFormText
          name="code"
          label="菜单标识"
          placeholder="请输入标识"
          rules={[{ required: true, message: '请输入标识' }]}
        />
        <ProFormRadio.Group
          rules={[{ required: true }]}
          name="type"
          label="菜单类型"
          options={[
            { label: '菜单', value: 'M' },
            { label: '按钮', value: 'B' },
            { label: '外链', value: 'L' },
            { label: '框架', value: 'I' },
          ]}
        />
        <ProFormDependency name={['type']}>
          {({ type }) =>
            type !== 'B' && (
              <>
                <ProFormText
                  name="icon"
                  label="菜单图标"
                  addonAfter={
                    <Button
                      onClick={() => {
                        setShowIcons(true);
                      }}
                    >
                      选择
                    </Button>
                  }
                  fieldProps={{ suffix: menuIcon }}
                  placeholder="请手动填写或点击右侧按钮选择"
                />
                <ProFormText
                  name="route"
                  label="路由地址"
                  placeholder="请输入路由地址"
                  extra="绝对路径，内部以/开头，外部以http(s)开头"
                />
              </>
            )
          }
        </ProFormDependency>

        <ProFormDependency name={['type']}>
          {({ type }) =>
            type === 'M' && (
              <>
                <ProFormText
                  name="component"
                  label="视图组件"
                  placeholder="请输入视图组件"
                  extra="相对于pages的视图组件路径"
                />
                <ProFormText name="redirect" label="重定向" placeholder="请输入重定向" />
              </>
            )
          }
        </ProFormDependency>

        <ProFormDependency name={['type']}>
          {({ type }) =>
            type !== 'B' && (
              <>
                <ProFormDigit name="sort" label="排序" placeholder="请输入排序" />
                <ProFormRadio.Group
                  name="is_hidden"
                  label="隐藏"
                  options={[
                    {
                      label: '是',
                      value: 1,
                    },
                    {
                      label: '否',
                      value: 2,
                    },
                  ]}
                />
              </>
            )
          }
        </ProFormDependency>

        <ProFormDependency name={['type']}>
          {({ type }) =>
            type === 'M' && !row && (
              <ProFormRadio.Group
                name="restful"
                label="生成按钮"
                tooltip="自动生成RestFul风格的增删改查等按钮"
                options={[
                  {
                    label: '是',
                    value: 1,
                  },
                  {
                    label: '否',
                    value: 2,
                  },
                ]}
              />
            )
          }
        </ProFormDependency>

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
        <ProFormTextArea name="remark" label="备注" />
      </DrawerForm>
      <Drawer
        width={600}
        open={showIcons}
        onClose={() => {
          setShowIcons(false);
        }}
        closable={false}
        placement="left"
        zIndex={1001}
      >
        <Card size="small" title="选择图标">
          <Space size={[12, 16]} wrap>
            {Object.values(IconMap).map((icon, index) => {
              return (
                <Button
                  // eslint-disable-next-line react/no-array-index-key
                  key={index.toString()}
                  icon={icon}
                  size="large"
                  onClick={() => {
                    formRef.current?.setFieldsValue({ icon: Object.keys(IconMap)[index] });
                    setMenuIcon(icon);
                  }}
                />
              );
            })}
          </Space>
        </Card>
      </Drawer>
    </PageContainer>
  );
};
