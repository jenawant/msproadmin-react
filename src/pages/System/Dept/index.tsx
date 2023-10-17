/* eslint-disable no-param-reassign */
import {
  DrawerForm,
  PageContainer,
  ProFormDigit,
  ProFormRadio, ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
  ProTable,
} from '@ant-design/pro-components';
import type {ActionType, ProColumns, ProFormInstance} from '@ant-design/pro-components';
import {Button, message as Message, Popconfirm, Space, Switch, Tag, Tooltip} from 'antd';
import {useRef, useState} from 'react';

import deptApi from '@/services/api/system/dept';
import {ArrowsAltOutlined, PlusOutlined, ShrinkOutlined} from '@ant-design/icons';
import {useIntl} from "@@/exports";
import React from 'react';
import user from "@/services/api/system/user";

type ColumnItem = {
  id: number; //2,
  parent_id: number; //0,
  level: string; //"0",
  name: string; //"研发部",
  leader: any[]; //"李风",
  phone: string; //"15566667777",
  status: number; //1,
  sort: number; //1,
  created_by: number; //1,
  updated_by: number; //1,
  created_at: string; //"2022-11-14 16:14:27",
  updated_at: string; //"2022-11-14 16:14:27",
  remark: string; //null
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [parentId, setParentId] = useState<number>(0);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [expandall, setExpandall] = useState<boolean>(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);
  const [deptData, setDeptData] = useState<ColumnItem[]>([]);
  const intl = useIntl();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: intl.formatMessage({id: 'pages.system.dept.name', defaultMessage: '部门名称',}),
      dataIndex: 'name',
      width: 300,
    },
    {
      title: intl.formatMessage({id: 'pages.system.dept.leader', defaultMessage: '负责人',}),
      dataIndex: 'leader',
      render: (_, record) => record.leader.map((item: any) => <Tag color="blue" key={item.id}>{item.nickname}</Tag>),
    },

    {
      title: intl.formatMessage({id: 'pages.common.sort', defaultMessage: '排序',}),
      key: 'sort',
      dataIndex: 'sort',
      hideInSearch: true,
    },
    {
      disable: true,
      title: intl.formatMessage({id: 'pages.system.dept.status', defaultMessage: '状态',}),
      dataIndex: 'status',
      filters: false,
      onFilter: true,
      ellipsis: true,
      valueType: 'select',
      valueEnum: {
        1: {
          text: intl.formatMessage({id: 'pages.common.open', defaultMessage: '启用',}),
          status: 'Success',
        },
        0: {
          text: intl.formatMessage({id: 'pages.common.forbiden', defaultMessage: '禁用',}),
          status: 'Error',
        },
      },
      initialValue: undefined,
      hideInTable: true,
    },
    {
      title: intl.formatMessage({id: 'pages.system.dept.status', defaultMessage: '状态',}),
      dataIndex: 'status',
      hideInSearch: true,
      render: (text, record) => (
        <Tooltip title={intl.formatMessage({id: 'pages.common.change_status', defaultMessage: '点击变更状态',})}>
          <Switch
            checkedChildren={intl.formatMessage({id: 'pages.common.open', defaultMessage: '启用',})}
            unCheckedChildren={intl.formatMessage({id: 'pages.common.forbiden', defaultMessage: '禁用',})}
            defaultChecked={text === 1}
            size="small"
            onChange={async (checked) => {
              const msg = await deptApi.changeStatus({id: record.id, status: checked ? 1 : 2});
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
      title: intl.formatMessage({id: 'pages.common.created_at', defaultMessage: '创建时间',}),
      key: 'created_at',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      render: (_: any, record: { created_at: any }) => record.created_at,
    },
    {
      title: intl.formatMessage({id: 'pages.common.action', defaultMessage: '操作',}),
      valueType: 'option',
      key: 'option',
      fixed: 'right',
      width: 250,
      render: (text: any, record: any) => [
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
          {intl.formatMessage({id: 'pages.common.new', defaultMessage: '新建'})}
        </Button>,
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
          {intl.formatMessage({id: 'pages.common.edit', defaultMessage: '编辑',})}
        </Button>,
        <Popconfirm
          key="popconfirm"
          title={intl.formatMessage({id: 'pages.common.confirm_delete', defaultMessage: '确定要删除吗？',})}
          onConfirm={async () => {
            const result = await deptApi.deletes({ids: [record.id]});
            if (result.success) {
              message.success(result.message);
              actionRef?.current?.reload?.();
            } else {
              message.error(result.message);
            }
          }}
          okText={intl.formatMessage({id: 'pages.common.confirm2', defaultMessage: '确认',})}
          cancelText={intl.formatMessage({id: 'pages.common.cancel', defaultMessage: '取消',})}
        >
          <Button size="small" key="delete" danger shape="round">
            {intl.formatMessage({id: 'pages.common.delete', defaultMessage: '删除',})}
          </Button>
        </Popconfirm>,
      ],
    },
  ];

  const rebuildMenu = (menus: any[]): any[] =>
    menus?.map((menu) => ({
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
              title: intl.formatMessage({id: 'pages.system.dept.auth', defaultMessage: '权限',}),
            },
            {
              path: '',
              title: intl.formatMessage({id: 'pages.system.dept.department_manage', defaultMessage: '部门管理',}),
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
        tableAlertRender={({selectedRowKeys, onCleanSelected}) => (
          <span>
            {intl.formatMessage({
              id: 'pages.common.selected',
              defaultMessage: '已选'
            })} {selectedRowKeys.length} {intl.formatMessage({id: 'pages.common.items', defaultMessage: '项'})}
            <Button type="link" style={{marginInlineStart: 8}} onClick={onCleanSelected}>
              {intl.formatMessage({id: 'pages.common.cancel_selected', defaultMessage: '取消选择'})}
            </Button>
          </span>
        )}
        tableAlertOptionRender={({selectedRowKeys}) => {
          return (
            <Space size={16}>
              <Popconfirm
                title={intl.formatMessage({
                  id: 'pages.common.confirm_batch_delete',
                  defaultMessage: '确定要批量删除吗？',
                })}
                onConfirm={async () => {
                  const msg = await deptApi.deletes({ids: selectedRowKeys});
                  if (msg.success) {
                    message.success(msg.message);
                    actionRef.current?.reload?.();
                  } else {
                    message.error(msg.message);
                  }
                }}
              >
                <Button type="link">{intl.formatMessage({
                  id: 'pages.common.batch_delete',
                  defaultMessage: '批量删除'
                })}</Button>
              </Popconfirm>
            </Space>
          );
        }}
        params={{withRelation: 'leader:id,nickname'}}
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
          params = {page: params.current, ...params};
          delete params.current;

          const result = await deptApi.getList({
            ...params,
            ...sorts,
          });
          setDeptData(result.data);
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
            icon={expandall ? <ShrinkOutlined/> : <ArrowsAltOutlined/>}
            onClick={() => {
              if (!expandall) {
                setExpandedRowKeys(deptData.map((item) => item.id));
              } else {
                setExpandedRowKeys([]);
              }
              setExpandall(!expandall);
            }}
          >
            {expandall ? intl.formatMessage({
              id: 'pages.common.zhedie',
              defaultMessage: '折叠'
            }) : intl.formatMessage({id: 'pages.common.zhankai', defaultMessage: '展开'})}
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
            icon={<PlusOutlined/>}
            onClick={() => setFormVisible(true)}
          >
            {intl.formatMessage({id: 'pages.common.new', defaultMessage: '新建'})}
          </Button>,
        ]}
        scroll={{x: 1500}}
      />
      <DrawerForm
        title={row ? intl.formatMessage({
          id: 'pages.common.edit',
          defaultMessage: '编辑',
        }) : intl.formatMessage({id: 'pages.common.add2', defaultMessage: '新增',})}
        width={500}
        layout="horizontal"
        labelCol={{span: 5}}
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
            result = await deptApi.update(row.id, values);
          } else {
            result = await deptApi.save(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success(intl.formatMessage({id: 'pages.common.submit_success', defaultMessage: '提交成功',}));
          formRef.current?.resetFields();
          setRow(undefined);
          setParentId(0);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormTreeSelect
          name="parent_id"
          label={intl.formatMessage({id: 'pages.system.dept.parent_id', defaultMessage: '上级部门',})}
          placeholder={intl.formatMessage({
            id: 'pages.system.dept.parent_id_placeholder',
            defaultMessage: "请选择上级部门",
          })}
          fieldProps={{
            treeDefaultExpandAll: true,
          }}
          request={async () =>
            rebuildMenu([{
              id: 0,
              name: intl.formatMessage({id: 'pages.system.dept.top_department', defaultMessage: '顶级部门',}),
              children: []
            }, ...deptData])
          }
        />
        <ProFormText
          name="name" label={intl.formatMessage({id: 'pages.system.dept.name', defaultMessage: '部门名称',})}
          tooltip={intl.formatMessage({id: 'pages.common.length_limit_24', defaultMessage: '最长为 24 位',})}
          placeholder={intl.formatMessage({id: 'pages.system.dept.name_placeholder', defaultMessage: '请输入名称',})}
          rules={[{
            required: true,
            message: intl.formatMessage({id: 'pages.system.dept.name_placeholder', defaultMessage: '请输入名称',})
          }]}
        />
        <ProFormSelect name={'leaders'}
                       label={intl.formatMessage({id: 'pages.system.dept.leader', defaultMessage: '负责人',})}
                       tooltip={intl.formatMessage({id: 'pages.system.dept.leader.tip'})}
                       request={async () => {
                         const response = await user.getOption();
                         return response.data.map((item: any) => ({label: item.nickname, value: item.id}))
                       }}
                       mode={"multiple"}
                       fieldProps={{
                         optionFilterProp: 'children',
                         filterOption: (input: string, option: any) =>
                           (option?.searchLabel ?? option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
                         allowClear: true,
                         showSearch: true,
                       }}
        />
        <ProFormDigit name="sort"
                      label={intl.formatMessage({id: 'pages.system.dept.sort', defaultMessage: '排序',})}
                      placeholder={intl.formatMessage({
                        id: 'pages.system.dept.sort_placeholder',
                        defaultMessage: '请输入排序',
                      })}/>
        <ProFormRadio.Group
          name="status" label={intl.formatMessage({id: 'pages.system.dept.status', defaultMessage: '状态',})}
          options={[
            {
              label: intl.formatMessage({id: 'pages.common.open', defaultMessage: '启用',}),
              value: 1,
            },
            {
              label: intl.formatMessage({id: 'pages.common.forbiden', defaultMessage: '禁用',}),
              value: 2,
            },
          ]}
        />
        <ProFormTextArea name="remark"
                         label={intl.formatMessage({id: 'pages.system.dept.remark', defaultMessage: '备注',})}/>
      </DrawerForm>
    </PageContainer>
  );
};
