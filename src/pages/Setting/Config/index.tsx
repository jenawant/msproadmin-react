/* eslint-disable no-param-reassign */
import type { ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDependency,
  ProFormGroup,
  ProFormItem,
  ProFormList,
  ProFormRadio,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  ProTable,
} from '@ant-design/pro-components';
import {
  Button,
  Drawer,
  message as Message,
  Modal,
  Popconfirm,
  Skeleton,
  Space,
  Tooltip,
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import commonApi from '@/services/api/common';
import configApi from '@/services/api/setting/config';
import tool from '@/services/tool';
import { EditOutlined, PlusOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons';
import { Access, FormattedMessage, getLocale, useAccess, useIntl } from '@umijs/max';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const storageMode = {
  '1': 'LOCAL',
  '2': 'OSS',
  '3': 'COS',
  '4': 'QINIU',
};

type ColumnItem = {
  group_id: number; //1,
  key: string; //"site_copyright",
  value: any; //null,
  name: string; //"版权信息",
  type: string; //STRING,
  input_type:
    | 'input'
    | 'textarea'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'upload'
    | 'editor'; //"textarea",
  config_select_data: any; //null,
  sort: number; //96,
  remark: string; //null
};

type GroupColumnItem = {
  id: number; //1,
  code: string; //"site_copyright",
  name: string; //"版权信息",
  created_by: number; //0,
  updated_by: number; //0,
  created_at: string; //
  updated_at: string; //
  remark: string; //null
};

const local = getLocale();
/**
 * 定义输入组件类型
 */
const typeEnum = {
  input: local === 'zh-CN' ? '文本框' : 'text',
  textarea: local === 'zh-CN' ? '文本域' : 'textarea',
  select: local === 'zh-CN' ? '下拉框' : 'select',
  radio: local === 'zh-CN' ? '单选框' : 'radio',
  checkbox: local === 'zh-CN' ? '复选框' : 'checkbox',
  switch: local === 'zh-CN' ? '开关' : 'switch',
  upload: local === 'zh-CN' ? '图片上传' : 'image',
  editor: local === 'zh-CN' ? '富文本编辑器' : 'editor',
};

export default () => {
  const access = useAccess();
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const groupFormRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [groupFormVisible, setGroupFormVisible] = useState<boolean>(false);
  const [groups, setGroups] = useState<GroupColumnItem[]>([]);
  const [group, setGroup] = useState<any>();
  const [reloadGroups, setReloadGroups] = useState<number>(0);
  const [reloadConfig, setReloadConfig] = useState<number>(0);

  const [tab, setTab] = useState<string>();
  const [addNew, setAddNew] = useState<boolean>(false);
  const [configs, setConfigs] = useState<ColumnItem[]>([]);
  const [configLoading, setConfigLoading] = useState<boolean>(true);

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetch = async () => {
      const msg = await configApi.getConfigGroupList();
      if (msg.success) {
        setGroups(msg.data);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        !tab && setTab(msg.data?.[0]?.code);
      }
    };
    fetch();
    return () => {
      setGroups([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadGroups]);

  useEffect(() => {
    const curGroup = groups.find((item) => item.code === tab) ?? { id: 0 };
    setGroup(curGroup);

    const fetch = async () => {
      setConfigLoading(true);
      const msg = await configApi.getConfigList({ group_id: curGroup.id });
      if (msg.success) {
        setConfigs(
          msg.data.map((item: ColumnItem) => ({
            ...item,
            value: ['checkbox', 'select'].includes(item.input_type)
              ? item.value.split(',')
              : item.value,
            config_select_data:
              ['radio', 'checkbox', 'select'].includes(item.input_type) &&
              item.config_select_data &&
              item.config_select_data.map((data: any) => ({
                ...data,
                value: data.value || data.code,
              })),
          })),
        );
      }
      setConfigLoading(false);
    };
    if (tab && curGroup.id > 0) fetch();
    return () => {
      setConfigs([]);
    };
  }, [tab, groups, reloadConfig]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  const intl = useIntl();

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: <FormattedMessage id="pages.system.config.protable.column.name" defaultMessage="" />,
      dataIndex: 'key',
      sorter: true,
      width: 200,
    },
    {
      title: <FormattedMessage id="pages.system.config.protable.column.alias" defaultMessage="" />,
      dataIndex: 'name',
    },
    {
      title: (
        <FormattedMessage
          id="pages.system.config.protable.column.input_component"
          defaultMessage=""
        />
      ),
      dataIndex: 'input_type',
      valueType: 'select',
      valueEnum: { ...typeEnum },
    },
    {
      title: <FormattedMessage id="pages.system.config.protable.column.value" defaultMessage="" />,
      dataIndex: 'value',
      hideInSearch: true,
      ellipsis: true,
    },
    {
      title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
      dataIndex: 'option',
      valueType: 'option',
      width: 150,
      hideInDescriptions: true,
      render: (_, record) => [
        <Access key="access-edit" accessible={access.check('setting:config:update')}>
          <Button
            key="edit"
            type="primary"
            shape="round"
            size="small"
            onClick={() => {
              setRow(record);
              const values = { ...record };
              if (
                ['radio', 'checkbox', 'select'].includes(values.input_type) &&
                values.config_select_data
              ) {
                values.config_select_data = values.config_select_data.map((data: any) => ({
                  ...data,
                  value: data.value || data.code,
                }));
              }
              formRef?.current?.setFieldsValue(values);
              setFormVisible(true);
            }}
          >
            <FormattedMessage id="pages.searchTable.edit" defaultMessage="" />
          </Button>
        </Access>,
        <Access key="access-delete" accessible={access.check('setting:config:delete')}>
          <Popconfirm
            key="delete"
            title={<FormattedMessage id="pages.common.confirm.delete" defaultMessage="Operating" />}
            onConfirm={async () => {
              const msg = await configApi.delete({ ids: record.key });
              if (msg.success) {
                actionRef?.current?.reload();
                setReloadGroups(Math.random());
              }
            }}
            okText={<FormattedMessage id="pages.common.button.ok" defaultMessage="" />}
            cancelText={<FormattedMessage id="pages.common.button.cancel" defaultMessage="" />}
          >
            <Button danger={true} shape="round" size="small">
              <FormattedMessage id="pages.searchTable.delete" defaultMessage="" />
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
              title: 'System',
            },
            {
              path: '',
              title: 'Setting',
            },
          ],
        },
      }}
    >
      {contextHolder}
      <ProCard
        loading={groups.length === 0}
        tabs={{
          type: 'editable-card',
          tabPosition: 'top',
          tabBarGutter: 8,
          addIcon: <PlusOutlined />,
          hideAdd: !access.check('setting:config:save'),
          activeKey: tab,
          onEdit: (targetKey: any, action: 'add' | 'remove') => {
            if (action === 'add') {
              setGroupFormVisible(true);
              setAddNew(true);
            }
            if (action === 'remove') {
              if (['site_config', 'upload_config'].includes(targetKey)) {
                message.warning(intl.formatMessage({ id: 'pages.setting.no_deleting_default' }));
                return;
              }
              Modal.confirm({
                title: intl.formatMessage(
                  { id: 'pages.setting.delete_group_title' },
                  { group: group.name },
                ),
                content: intl.formatMessage({ id: 'pages.setting.delete_group_content' }),
                onOk: async () => {
                  const result = await configApi.deleteConfigGroup({ id: group.id });
                  if (result.success) {
                    message.success(result.message);
                    setTab('site_config');
                    setReloadGroups(Math.random());
                  } else {
                    message.error(result.message);
                  }
                },
              });
            }
          },
          tabBarExtraContent: {
            right: (
              <Space style={{ marginRight: 24 }}>
                <Access key="access-add" accessible={access.check('setting:config:save')}>
                  <Button
                    size="small"
                    key="button"
                    type="primary"
                    shape="round"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setFormVisible(true);
                      formRef.current?.setFieldsValue({ sort: 0, group_id: group.id });
                    }}
                  >
                    {intl.formatMessage({ id: 'pages.setting.button.add_config' })}
                  </Button>
                </Access>
                <Tooltip title={intl.formatMessage({ id: 'pages.setting.button.refresh.tips' })}>
                  <Button
                    size="small"
                    shape="round"
                    icon={<ReloadOutlined />}
                    onClick={() => setReloadConfig(Math.random())}
                  />
                </Tooltip>
                <Access key="access-update" accessible={access.check('setting:config:update')}>
                  <Tooltip title={intl.formatMessage({ id: 'pages.setting.button.manage.tips' })}>
                    <Button
                      size="small"
                      shape="round"
                      icon={<SettingOutlined />}
                      onClick={() => setDrawerVisible(true)}
                    />
                  </Tooltip>
                </Access>
              </Space>
            ),
          },
          items: groups.map((item) => ({
            label: item.name,
            key: item.code,
            closable: access.check('setting:config:delete'),
            children: (
              <ProForm
                onFinish={async (fields) => {
                  const values = { ...fields };
                  Object.keys(values).forEach((key: string) => {
                    // 检测是否存在上传字段.ADD.JENA.20221207
                    const uploadKey = configs?.some(
                      (cfg) => cfg.input_type === 'upload' && cfg.key === key,
                    );
                    if (uploadKey) {
                      values[key] = values[key]?.[0]?.url ?? '';
                    }
                    // 检测是否存在开关字段
                    const switchKey = configs?.some(
                      (cfg) => cfg.input_type === 'switch' && cfg.key === key,
                    );
                    if (switchKey) {
                      values[key] = values[key] ? '1' : '0';
                    }
                    // 检测是否存在复选字段
                    const checkboxKey = configs?.some(
                      (cfg) => cfg.input_type === 'checkbox' && cfg.key === key,
                    );
                    if (checkboxKey && Array.isArray(values[key])) {
                      values[key] = values[key].join(',');
                    }
                    // 检测是否存在单选字段
                    const selectKey = configs?.some(
                      (cfg) => cfg.input_type === 'select' && cfg.key === key,
                    );
                    if (selectKey && Array.isArray(values[key])) {
                      values[key] = values[key][0];
                    }
                  });

                  const msg = await configApi.updateByKeys(values);
                  if (msg.success) {
                    message.success(msg.message);
                    setReloadGroups(Math.random());
                  } else {
                    message.error(msg.message);
                  }
                }}
                submitter={{
                  submitButtonProps: {
                    disabled: configs.length === 0,
                  },
                  resetButtonProps: {
                    disabled: configs.length === 0,
                  },
                }}
              >
                {configs
                  ?.sort((a, b) => b.sort - a.sort)
                  ?.map((config: ColumnItem) => {
                    switch (config.input_type) {
                      case 'input':
                        return (
                          <ProFormText
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value}
                          />
                        );
                      case 'textarea':
                        return (
                          <ProFormTextArea
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value}
                          />
                        );
                      case 'editor':
                        return (
                          <ProFormItem label={config.name} key={config.key} name={config.key}>
                            <ReactQuill
                              theme="snow"
                              defaultValue={config.value ?? '<p><br></p>'}
                              onChange={(value) => {
                                formRef.current?.setFieldValue(
                                  config.key,
                                  value.replaceAll('<p><br></p>', ''),
                                );
                              }}
                              className="custom-editor"
                            />
                          </ProFormItem>
                        );
                      case 'checkbox':
                        return (
                          <ProFormCheckbox.Group
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value}
                            options={config.config_select_data}
                          />
                        );
                      case 'radio':
                        return (
                          <ProFormRadio.Group
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value}
                            options={config.config_select_data}
                          />
                        );
                      case 'select':
                        return (
                          <ProFormSelect
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value}
                            options={config.config_select_data}
                          />
                        );
                      case 'switch':
                        return (
                          <ProFormSwitch
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            initialValue={config.value === '1'}
                          />
                        );
                      case 'upload':
                        return (
                          <ProFormUploadButton
                            label={config.name}
                            key={config.key}
                            name={config.key}
                            max={1}
                            fieldProps={{
                              name: 'file',
                              listType: 'picture-card',
                              customRequest: async ({ file, onSuccess, onError }) => {
                                const formData = new FormData();
                                formData.append('image', file);
                                const msg = await commonApi.uploadImage(formData);
                                if (msg.success) {
                                  msg.data.url = tool.attachUrl(
                                    msg.data.url,
                                    storageMode[msg.data.storage_mode],
                                  );
                                  onSuccess?.(msg);
                                } else {
                                  message.error(msg.message);
                                  onError?.({ method: 'POST' } as any);
                                }
                              },
                              onChange: async (info) => {
                                if (info.file.status === 'uploading') {
                                  return;
                                }
                                if (info.file.status === 'done') {
                                  info.file.url = info.file.response.data.url;
                                }
                                return info;
                              },
                              onPreview: async (file) => {
                                let src = file.url;
                                if (!src) {
                                  src = (await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.readAsDataURL(file.originFileObj as any);
                                    reader.onload = () => resolve(reader.result as any);
                                  })) as string;
                                }
                                const image = new Image();
                                image.src = src;
                                const imgWindow = window.open(src);
                                imgWindow?.document.write(image.outerHTML);
                              },
                            }}
                            initialValue={[{ uid: -1, url: config.value }]}
                          />
                        );
                      default:
                        return null;
                    }
                  })}
                {configLoading && <Skeleton active />}
              </ProForm>
            ),
          })),
          onChange: (key) => {
            setTab(key);
          },
        }}
      />

      <ModalForm
        formRef={formRef}
        title={intl.formatMessage({
          id: row
            ? 'pages.system.config.modalform.update.title'
            : 'pages.system.config.modalform.create.title',
          defaultMessage: '',
        })}
        width="600px"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        layout={'horizontal'}
        open={formVisible}
        onOpenChange={setFormVisible}
        modalProps={{
          maskClosable: false,
          forceRender: true,
          zIndex: 1001,
          onCancel: () => {
            setRow(undefined);
            formRef.current?.resetFields();
          },
        }}
        onFinish={async (fields) => {
          let msg;
          if (row) {
            msg = await configApi.update(fields);
          } else {
            msg = await configApi.save(fields);
          }

          if (msg.success) {
            setFormVisible(false);
            setRow(undefined);
            formRef.current?.resetFields();
            setReloadGroups(Math.random());
          } else {
            message.error(msg.message);
          }
        }}
        onValuesChange={(changeValues) => {
          const field = Object.keys(changeValues)[0];
          if (field == 'key') {
            formRef?.current?.setFieldsValue({ key: changeValues[field].toUpperCase() });
          }
        }}
      >
        <ProFormSelect
          name="group_id"
          label={intl.formatMessage({ id: 'pages.setting.form.field.group.label' })}
          params={group}
          request={async () => groups.map((item) => ({ label: item.name, value: item.id }))}
          readonly
        />
        <ProFormText
          tooltip={intl.formatMessage({
            id: 'pages.system.config.modalform.tooltip.name',
            defaultMessage: '',
          })}
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.system.config.modalform.required.name"
                  defaultMessage=""
                />
              ),
            },
            {
              pattern: /^\w+$/gi,
              message: (
                <FormattedMessage
                  id="pages.system.config.modalform.format.name"
                  defaultMessage=""
                />
              ),
            },
          ]}
          readonly={!row ? false : true}
          name="key"
          label={
            <FormattedMessage id="pages.system.config.protable.column.name" defaultMessage="" />
          }
        />

        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.system.config.modalform.required.alias"
                  defaultMessage=""
                />
              ),
            },
          ]}
          name="name"
          label={
            <FormattedMessage id="pages.system.config.protable.column.alias" defaultMessage="" />
          }
        />
        <ProFormText
          name="value"
          label={intl.formatMessage({ id: 'pages.setting.form.field.value.label' })}
          rules={[{ required: false }]}
        />
        <ProFormText
          name="sort"
          label={intl.formatMessage({ id: 'pages.setting.form.field.sort.label' })}
        />
        <ProFormSelect
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.system.config.modalform.required.input_component"
                  defaultMessage=""
                />
              ),
            },
          ]}
          valueEnum={{ ...typeEnum }}
          name="input_type"
          label={
            <FormattedMessage
              id="pages.system.config.protable.column.input_component"
              defaultMessage=""
            />
          }
        />
        <ProFormDependency name={['input_type']}>
          {({ input_type }) => {
            switch (input_type) {
              case 'radio':
              case 'checkbox':
              case 'select':
                return (
                  <ProFormList
                    rules={[
                      {
                        required: true,
                        validator: (_, values: any[]) => {
                          return values.filter(
                            (item) =>
                              !item.label ||
                              tool.trim(item.label) === '' ||
                              !item.value ||
                              tool.trim(item.value) === '',
                          ).length > 0
                            ? Promise.reject(
                                new Error(
                                  intl.formatMessage({
                                    id: 'pages.system.config.modalform.required.select_value',
                                  }),
                                ),
                              )
                            : Promise.resolve();
                        },
                      },
                    ]}
                    initialValue={[
                      {
                        label: '',
                        value: '',
                      },
                    ]}
                    min={1}
                    name="config_select_data"
                    label={
                      <FormattedMessage
                        id="pages.system.config.protable.column.select_value"
                        defaultMessage=""
                      />
                    }
                  >
                    <ProFormGroup key="group">
                      <ProFormText
                        name="label"
                        placeholder={intl.formatMessage({ id: 'pages.common.form.key' })}
                        fieldProps={{ style: { width: 100 } }}
                      />
                      <ProFormText
                        name="value"
                        placeholder={intl.formatMessage({ id: 'pages.common.form.val' })}
                      />
                    </ProFormGroup>
                  </ProFormList>
                );
              default:
                return null;
            }
          }}
        </ProFormDependency>
      </ModalForm>
      <ModalForm
        title={intl.formatMessage({
          id:
            group && !addNew
              ? 'pages.setting.groupform.title.edit'
              : 'pages.setting.groupform.title.add',
        })}
        width={300}
        open={groupFormVisible}
        onOpenChange={(open) => setGroupFormVisible(open)}
        formRef={groupFormRef}
        autoFocusFirstInput
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            groupFormRef.current?.resetFields();
          },
        }}
        request={async () => (addNew ? {} : group)}
        submitTimeout={2000}
        onFinish={async (values) => {
          let result;
          if (group && !addNew) {
            result = await configApi.updateConfigGroup({ id: group.id, ...values });
          } else {
            result = await configApi.saveConfigGroup(values);
          }
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success(result.message);
          groupFormRef.current?.resetFields();
          setGroupFormVisible(false);
          setReloadGroups(Math.random());
          return true;
        }}
      >
        <ProForm.Group>
          <ProFormText
            width="md"
            name="name"
            label={intl.formatMessage({ id: 'pages.setting.groupform.field.name.label' })}
            rules={[{ required: true }]}
          />

          <ProFormText
            width="md"
            name="code"
            label={intl.formatMessage({ id: 'pages.setting.groupform.field.code.label' })}
            rules={[
              { required: true },
              {
                pattern: /^\w+$/gi,
                message: (
                  <FormattedMessage
                    id="pages.system.config.modalform.format.name"
                    defaultMessage=""
                  />
                ),
              },
            ]}
            disabled={!addNew}
          />
        </ProForm.Group>
        <ProFormTextArea
          name="remark"
          label={intl.formatMessage({ id: 'pages.setting.groupform.field.remark.label' })}
        />
      </ModalForm>
      <Drawer
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
        }}
        width={'60%'}
      >
        <ProTable<ColumnItem>
          columns={columns}
          actionRef={actionRef}
          rowSelection={{
            // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            defaultSelectedRowKeys: [],
          }}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
            <span>
              {intl.formatMessage(
                { id: 'component.table.cancel_select.selected' },
                { size: selectedRowKeys.length },
              )}
              <Button type="link" style={{ marginInlineStart: 8 }} onClick={onCleanSelected}>
                {intl.formatMessage({ id: 'component.table.cancel_select' })}
              </Button>
            </span>
          )}
          tableAlertOptionRender={({ selectedRowKeys }) => {
            return (
              <Space size={16}>
                <Popconfirm
                  title={intl.formatMessage({ id: 'component.form.button.tipsbatchdelete' })}
                  onConfirm={async () => {
                    const msg = await configApi.delete({ ids: selectedRowKeys });
                    if (msg.success) {
                      message.success(msg.message);
                      setReloadGroups(Math.random());
                    } else {
                      message.error(msg.message);
                    }
                  }}
                >
                  <Button type="link">
                    {intl.formatMessage({ id: 'component.form.button.batchdelete' })}
                  </Button>
                </Popconfirm>
              </Space>
            );
          }}
          params={configs}
          request={async () => {
            return {
              data: configs,
              success: true,
            };
          }}
          columnsState={{
            persistenceKey: window.location.pathname.replaceAll('/', '_'),
            persistenceType: 'localStorage',
          }}
          rowKey="key"
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
          headerTitle={intl.formatMessage({ id: 'pages.setting.grouptable.title' })}
          toolBarRender={() => [
            <Button
              size="small"
              key="group"
              shape="round"
              icon={<EditOutlined />}
              onClick={() => {
                setGroupFormVisible(true);
                setAddNew(false);
              }}
            >
              {intl.formatMessage({ id: 'pages.setting.groupform.title.edit' })}
            </Button>,
          ]}
        />
      </Drawer>
    </PageContainer>
  );
};
