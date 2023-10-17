/* eslint-disable no-param-reassign */
import {
  ModalForm,
  PageContainer,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, message as Message, Modal, Popconfirm, Switch, Tooltip } from 'antd';
import React, { useRef, useState } from 'react';

import moduleApi from '@/services/api/setting/module';
import { DatabaseOutlined, PlusOutlined } from '@ant-design/icons';

import { useAccess, Access } from '@umijs/max';

type ColumnItem = {
  name: string; //"Merchant",
  label: string; //"商户模块",
  description: string; //"商户核心模块，包含基本信息，业务国家，消息模板，充值消费记录，消息发送记录",
  installed: boolean; //true,
  enabled: boolean; //true,
  version: string; //"1.0.0",
  order: number; //0
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const access = useAccess();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: '模块名称',
      dataIndex: 'name',
    },
    {
      title: '模块标签',
      dataIndex: 'label',
    },
    {
      title: '版本号',
      dataIndex: 'version',
      hideInSearch: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      hideInSearch: true,
      render: (text, record) => (
        <Tooltip title="点击变更状态">
          <Switch
            disabled={!access.check('setting:module:status')}
            checkedChildren="启用"
            unCheckedChildren="禁用"
            defaultChecked={text === true}
            size="small"
            onChange={async (checked) => {
              const msg = await moduleApi.modifyStatus({ name: record.name, status: checked });
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
      render: (text: any, record: any) => [
        <Access key="popconfirm-add" accessible={access.check('setting:module:install')}>
          <Popconfirm
            title="确定要安装数据吗？如表和数据已存在则可能无效！"
            onConfirm={async () => {
              const result = await moduleApi.install({ name: record.name });
              if (result.success) {
                message.success(result.message);
              } else {
                message.error(result.message);
              }
            }}
            okText="确认"
            cancelText="取消"
          >
            <Button key="add" size="small" type="primary" shape="round" icon={<DatabaseOutlined />}>
              安装数据
            </Button>
          </Popconfirm>
        </Access>,

        <Access key="delete" accessible={access.check('setting:module:delete')}>
          <Button
            size="small"
            key="delete"
            danger
            shape="round"
            onClick={() => {
              Modal.confirm({
                title: `确定要删除 ${record.label} 模块吗？`,
                content: '此操作会删除文件和数据表，导致模块不能正常使用',
                onOk: async () => {
                  const result = await moduleApi.deletes({ name: record.name });
                  if (result.success) {
                    message.success(result.message);
                    actionRef?.current?.reload?.();
                  } else {
                    message.error(result.message);
                  }
                },
              });
            }}
          >
            删除
          </Button>
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
              title: '工具',
            },
            {
              path: '',
              title: '模块管理',
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

          const result = await moduleApi.getPageList({
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
        rowKey="name"
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
          <Access key="button" accessible={access.check('setting:module:save')}>
            <Button
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
        title={'新增'}
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
          const result = await moduleApi.save(values);
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success('提交成功');
          formRef.current?.resetFields();
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
      >
        <ProForm.Group>
          <ProFormText
            name="name"
            label="模块名称"
            tooltip="英文标识，最长为 24 位"
            placeholder="请输入名称"
            rules={[{ required: true, message: '请输入名称' }]}
          />

          <ProFormText
            name="label"
            label="模块标签"
            placeholder="请输入标签"
            rules={[{ required: true, message: '请输入标签' }]}
          />
        </ProForm.Group>
        <ProFormText
          name="version"
          label="版本号"
          placeholder="请输入版本号"
          rules={[{ required: true, message: '请输入版本号' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入模块的功能描述"
          rules={[{ required: true, message: '请输入模块的功能描述' }]}
        />
      </ModalForm>
    </PageContainer>
  );
};
