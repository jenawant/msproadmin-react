/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormGroup,
  ProFormItem,
  ProFormRadio,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Avatar, Button, message as Message, Modal, Popconfirm, Space, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import common from '@/services/api/common';
import notice from '@/services/api/system/notice';
import { CheckSquareOutlined, OrderedListOutlined, PlusOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ColumnItem = {
  id: number; //1,
  message_id: number; //1,
  title: string; //"test",
  type: number; //1,
  content: string; //"<p>aaaaaaaaaaaaaaaaa</p>",
  click_num: number; //0,
  created_by: number; //1,
  updated_by: number; //1,
  created_at: string; //"2023-02-03 10:18:00",
  updated_at: string; //"2023-02-03 10:18:00",
  remark: string; //null
};
type UserItem = {
  id: number; //1,
  username: string; //"admin",
  password: string; //"$2y$10$AyHgI.8IgFRpvNJUKMYPX.Sr2qUxJOe0wVjFbbVrAlaY1yqnSkTla",
  user_type: string; //"100",
  nickname: string; //"超级管理员",
  phone: string; // "18877779999",
  email: string; //"admin@test.com",
  avatar: string; //"http://127.0.0.1:9501/uploadfile/20221130/456469317815373824.jpg",
  signed: string; //"广阔天地，大有所为",
  dashboard: string; //"statistics",
  dept_id: number; //1,
  merchant_id: number; //null,
  status: number; //1,
  login_ip: string; //"172.17.0.1",
  login_time: string; //"2023-02-10 10:45:19",
  backend_setting: null;
  created_by: number; //0,
  updated_by: number; //1,
  created_at: string; //"2022-11-10 15:59:00",
  updated_at: string; //"2023-02-10 10:45:19",
  remark: string; //null
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState(false);

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '标题',
      dataIndex: 'title',
    },
    {
      disable: true,
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      request: async () => {
        const msg = await common.getDict('backend_notice_type');
        if (msg.success) {
          return msg.data.map((item: { title: any; key: any }) => ({
            label: item.title,
            value: item.key,
          }));
        }
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateRange',
      sorter: true,
      defaultSortOrder: 'descend',
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
          编辑
        </Button>,
        <Popconfirm
          key="popconfirm"
          title="确定要删除吗？"
          onConfirm={async () => {
            const result = await notice.deletes({ ids: [record.id] });
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

  const loadUserRef = useRef<ActionType>();
  const [loadUserVisible, setLoadUserVisible] = useState<boolean>(false);
  const [selectedUserKeys, setSelectedUserKeys] = useState<UserItem[]>([]);
  const userColumns: ProColumns<UserItem>[] = [
    {
      title: '',
      dataIndex: 'avatar',
      valueType: 'avatar',
      search: false,
    },
    {
      title: '账户',
      dataIndex: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '手机',
      dataIndex: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '部门',
      dataIndex: 'dept_id',
      valueType: 'treeSelect',
      request: async () => {
        const msg = await common.getDeptTreeList();
        if (msg.success) {
          return msg.data;
        }
      },
      hideInTable: true,
    },
    {
      title: '角色',
      dataIndex: 'role_id',
      valueType: 'select',
      request: async () => {
        const msg = await common.getRoleList();
        if (msg.success) {
          return msg.data.map((item: any) => ({
            label: item.name,
            value: item.code,
          }));
        }
      },
      hideInTable: true,
    },
    {
      title: '岗位',
      dataIndex: 'post_id',
      valueType: 'select',
      request: async () => {
        const msg = await common.getPostList();
        if (msg.success) {
          return msg.data.map((item: any) => ({
            label: item.name,
            value: item.code,
          }));
        }
      },
      hideInTable: true,
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
              title: '通知公告',
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
                  const msg = await notice.deletes({ ids: selectedRowKeys });
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

          const result = await notice.getPageList({
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
        width={500}
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
        initialValues={row ?? { type: 1 }}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          values.users = selectedUserKeys.map((user: UserItem) => user.id);
          if (row) {
            result = await notice.update(row.id, values);
          } else {
            result = await notice.save(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          formRef.current?.resetFields();
          setRow(undefined);
          setFormVisible(false);
          setSelectedUserKeys([]);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProFormText
          name="title"
          label="标题"
          tooltip="最长为 24 位"
          placeholder="请输入标题"
          rules={[{ required: true, message: '请输入标题' }]}
        />

        <ProFormRadio.Group
          name="type"
          label="类型"
          rules={[{ required: true, message: '请选择类型' }]}
          request={async () => {
            const msg = await common.getDict('backend_notice_type');
            if (msg.success) {
              return msg.data.map((item: { title: any; key: any }) => ({
                label: item.title,
                value: Number(item.key),
              }));
            }
          }}
        />
        {!row && (
          <ProFormItem label="接收用户" extra="不选择，则为所有用户发送">
            <ProFormGroup>
              <Button
                type="primary"
                icon={<OrderedListOutlined />}
                onClick={() => setLoadUserVisible(true)}
              >
                选择用户({selectedUserKeys.length})
              </Button>
              <Avatar.Group maxCount={10}>
                {selectedUserKeys.map((user: UserItem) => (
                  <Tooltip key={user.id} title={`${user.username}`}>
                    <Avatar src={user.avatar} />
                  </Tooltip>
                ))}
              </Avatar.Group>
            </ProFormGroup>
          </ProFormItem>
        )}

        <ProFormItem
          label="内容"
          name="content"
          rules={[{ required: true, message: '请填写内容' }]}
        >
          <ReactQuill
            theme="snow"
            defaultValue={row?.content ?? '<p><br></p>'}
            onChange={(value) => {
              formRef.current?.setFieldValue('content', value.replaceAll('<p><br></p>', ''));
            }}
            className="custom-editor"
          />
        </ProFormItem>

        <ProFormText name="remark" label="备注" />
      </ModalForm>
      <Modal
        title="选择用户"
        width={900}
        open={loadUserVisible}
        onCancel={() => setLoadUserVisible(false)}
        destroyOnClose
        closable={false}
        footer={false}
      >
        <ProTable<UserItem>
          columns={userColumns}
          actionRef={loadUserRef}
          defaultSize="small"
          rowSelection={{
            // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            defaultSelectedRowKeys: [],
            selectedRowKeys: selectedUserKeys.map((user: UserItem) => user.id),
            onSelect: (record: UserItem, selected: boolean) => {
              setSelectedUserKeys(
                selected
                  ? Array.from(new Set([...selectedUserKeys, record]))
                  : selectedUserKeys.filter((item) => item !== record),
              );
            },
            onSelectAll: (selected, selectedRows: UserItem[], changeRows: UserItem[]) =>
              setSelectedUserKeys(
                selected
                  ? Array.from(new Set([...selectedUserKeys, ...selectedRows.filter((o) => o)]))
                  : selectedUserKeys.filter((o) => !changeRows.find((item) => item === o)),
              ),
            alwaysShowAlert: true,
          }}
          tableAlertRender={() => (
            <span>
              已选 {selectedUserKeys.length} 项
              <Button
                type="link"
                style={{ marginInlineStart: 8 }}
                onClick={() => setSelectedUserKeys([])}
                disabled={selectedUserKeys.length === 0}
              >
                取消选择
              </Button>
            </span>
          )}
          tableAlertOptionRender={() => {
            return (
              <Space size={16}>
                <Button
                  size="small"
                  type="primary"
                  onClick={async () => {
                    setLoadUserVisible(false);
                  }}
                  icon={<CheckSquareOutlined />}
                >
                  确定
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

            const result = await common.getUserList({
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
            persistenceKey: window.location.pathname.replaceAll('/', '_') + '_load_users',
            persistenceType: 'localStorage',
          }}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            filterType: 'light',
          }}
          options={false}
          pagination={{
            showSizeChanger: true,
            pageSize: 10,
          }}
        />
      </Modal>
    </PageContainer>
  );
};
