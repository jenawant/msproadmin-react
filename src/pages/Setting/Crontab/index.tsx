/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProFormFieldSet,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, message as Message, Popconfirm, Space, Switch, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import crontabApi from '@/services/api/setting/crontab';
import { PlayCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { isEmpty } from 'lodash';

type ColumnItem = {
  id: number; //1,
  name: string; //"urlCrontab",
  type: number; //3,
  target: string; //"http://127.0.0.1:9501/",
  parameter: string; //"",
  rule: string; //"59 */1 * * * *",
  singleton: number; //2,
  status: number; //2,
  created_by: number; //null,
  updated_by: number; //null,
  created_at: string; //"2021-08-07 23:28:28",
  updated_at: string; //"2022-12-05 09:02:31",
  remark: string; //"请求127.0.0.1"
};

type LogColumnItem = {
  id: number; //1,
  crontab_id: number; //1,
  name: string; //"urlCrontab",
  target: string; //"http://127.0.0.1:9501/",
  parameter: string; //"",
  exception_info: string; //null,
  status: number; //2,
  created_at: string; //"2021-08-07 23:28:28",
};

const CrontabTypes = [
  { label: '命令任务', value: 1 },
  { label: '类任务', value: 2 },
  { label: 'URL任务', value: 3 },
  { label: 'PHP脚本任务', value: 4 },
];

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const logActionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '任务名称',
      dataIndex: 'name',
    },
    {
      title: '任务类型',
      dataIndex: 'type',
      valueType: 'select',
      request: async () => CrontabTypes,
    },
    {
      title: '定时规则',
      dataIndex: 'rule',
      hideInSearch: true,
    },
    {
      title: '调用目标',
      dataIndex: 'target',
      hideInSearch: true,
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
        2: {
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
              const msg = await crontabApi.changeStatus({ id: record.id, status: checked ? 1 : 2 });
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
        <Popconfirm
          key="execute"
          title="确定要立即执行一次任务吗？"
          onConfirm={async () => {
            const msg = await crontabApi.run({ id: record.id });
            if (!msg.success) {
              message.error(msg.message);
              return false;
            }

            message.success(msg.message);
            return true;
          }}
        >
          <Button size="small" type="primary" icon={<PlayCircleOutlined />} shape="round">
            执行一次
          </Button>
        </Popconfirm>,
        <Button
          size="small"
          key="log"
          onClick={() => {
            setRow(record);
            setDrawerVisible(true);
          }}
          shape="round"
        >
          日志
        </Button>,
        <Button
          size="small"
          key="edit"
          onClick={() => {
            const rowData = { ...record };
            rowData.rule = rowData.rule.split(' ');
            if (rowData.rule.length === 5) {
              rowData.rule = ['', ...rowData.rule];
            }
            setRow(rowData);
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
            const result = await crontabApi.deletes({ ids: [record.id] });
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

  const logColumns: ProColumns<LogColumnItem>[] = [
    {
      title: '执行时间',
      dataIndex: 'created_at',
      sorter: true,
      defaultSortOrder: 'descend',
      width: 160,
    },
    {
      title: '执行结果',
      dataIndex: 'status',
      valueEnum: {
        1: {
          text: '成功',
          status: 'Success',
        },
        2: {
          text: '失败',
          status: 'Error',
        },
      },
      width: 80,
    },
    {
      title: '异常信息',
      dataIndex: 'exception_info',
    },

    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Popconfirm
          key="popconfirm"
          title="确定要删除吗？"
          onConfirm={async () => {
            const result = await crontabApi.deleteLog({ ids: [record.id] });
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
              title: '工具',
            },
            {
              path: '',
              title: '定时任务',
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
                  const msg = await crontabApi.deletes({ ids: selectedRowKeys });
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

          const result = await crontabApi.getPageList({
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
          defaultCollapsed: false,
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
        width={400}
        grid={true}
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
        initialValues={row ?? { status: 2, singleton: 2 }}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (row) {
            result = await crontabApi.update(row.id, values);
          } else {
            result = await crontabApi.save(values);
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
        <ProFormText
          colProps={{ span: 12 }}
          name="name"
          label="任务名称"
          tooltip="最长为 24 位"
          placeholder="请输入名称"
          rules={[{ required: true, message: '请输入名称' }]}
        />

        <ProFormSelect
          colProps={{ span: 12 }}
          name="type"
          label="任务类型"
          placeholder="请选择任务类型"
          request={async () => CrontabTypes}
          rules={[{ required: true, message: '请选择任务类型' }]}
        />
        <ProFormFieldSet
          name="rule"
          label="定时规则"
          transform={(value: any) => ({ rule: value.join(' ') })}
          rules={[
            { required: true, message: '请输入定时规则' },
            {
              validator: (_, value) => {
                const tmp = [...value];
                tmp.shift();
                return tmp.filter((item: any) => !isEmpty(item)).length === 5
                  ? Promise.resolve()
                  : Promise.reject(new Error('规则至少连续包含5段（右侧算起）'));
              },
            },
          ]}
          tooltip={
            <div>
              <p>规则为5段时，以分钟级执行，例如：*/5 * * * *，每5分钟执行一次任务</p>
              <p>规则为6段时，以秒级执行，例如：30 */5 * * * *，每5分钟的第30秒执行一次任务</p>
            </div>
          }
          extra="规则解释：* * * * * *，左起分别代表：秒 分 时 日 月 周"
        >
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="秒"
          />
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="分"
          />
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="时"
          />
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="日"
          />
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="月"
          />
          <ProFormText
            colProps={{ span: 4 }}
            fieldProps={{ allowClear: false, style: { textAlign: 'center' } }}
            placeholder="周"
          />
        </ProFormFieldSet>
        <ProFormTextArea
          name="target"
          label="调用目标"
          placeholder="请输入调用目标"
          rules={[{ required: true, message: '请输入调用目标' }]}
        />
        <ProFormTextArea name="parameter" label="任务参数" placeholder="请输入任务参数" />
        <ProFormRadio.Group
          colProps={{ span: 12 }}
          name="singleton"
          label="单次执行"
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
        <ProFormRadio.Group
          colProps={{ span: 12 }}
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
      </ModalForm>
      <Drawer
        title="执行日志"
        width={'60%'}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setRow(undefined);
        }}
      >
        <ProTable<LogColumnItem>
          size="small"
          columns={logColumns}
          actionRef={logActionRef}
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
                    const msg = await crontabApi.deleteLog({ ids: selectedRowKeys });
                    if (msg.success) {
                      message.success(msg.message);
                      logActionRef.current?.reload?.();
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
          params={{ crontab_id: row?.id }}
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

            const result = await crontabApi.getLogPageList({
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
            persistenceKey: window.location.pathname.replaceAll('/', '_') + '_LOG',
            persistenceType: 'localStorage',
          }}
          rowKey="id"
          search={false}
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
        />
      </Drawer>
    </PageContainer>
  );
};
