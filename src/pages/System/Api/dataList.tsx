import apiColumn from '@/services/api/system/apiColumn';
import {dict} from '@/services/api/system/dict';
import {ModalForm} from '@ant-design/pro-form';
import {Button, Form, message as Message, Modal, Popconfirm, Space, Switch} from 'antd';
import React, {useRef, useState} from 'react';

import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {
  ProFormItem,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable
} from '@ant-design/pro-components';
import type {RequestOptionsType} from '@ant-design/pro-utils';
import type {ColumnItem as ApiColumnItem} from './index';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type ColumnItem = {
  id?: number; //主键
  api_id?: number; //接口主键
  name?: string; //字段名称
  type?: number; //字段类型 1 请求 2 返回
  data_type?: string; //数据类型
  is_required?: number; //是否必填 1 非必填 2 必填
  default_value?: string; //默认值
  status?: number; //状态 (1正常 2停用)
  description?: string; //字段说明
  created_by?: number; //创建者
  updated_by?: number; //更新者
  created_at?: string; //创建时间
  updated_at?: string; //更新时间
  deleted_at?: string; //删除时间
  remark?: string; //备注
};

const crud = {
  autoRequest: false,
  api: apiColumn.getList,
  recycleApi: apiColumn.getRecycleList,
  showIndex: false,
  searchLabelWidth: '75px',
  pageLayout: 'fixed',
  rowSelection: { showCheckedAll: true },
  operationColumn: true,
  operationWidth: 300,
  add: { show: true, api: apiColumn.save, auth: ['system:api:save'] },
  edit: { show: true, api: apiColumn.update, auth: ['system:api:update'] },
  delete: {
    show: true,
    api: apiColumn.deletes,
    auth: ['system:api:delete'],
    realApi: apiColumn.realDeletes,
    realAuth: ['system:api:realDeletes'],
  },
  import: {
    show: true,
    url: 'system/apiColumn/import',
    templateUrl: 'system/apiColumn/downloadTemplate',
  },
  export: { show: true, url: 'system/apiColumn/export' },
  recovery: { show: true, api: apiColumn.recoverys, auth: ['system:api:recovery'] },
  viewLayoutSetting: { layout: 'customer', width: '800px' },
  /*  beforeAdd: (form) => form.api_id = currentRow.value.id,
    beforeRequest: (params) => {
      params.api_id = currentRow.value.id
      params.type = currentType.value == 'request' ? 1 : 2
    },*/
  dict: dict.getDict,
};

export type FormProps = {
  onCancel: (flag?: boolean) => void;
  modalVisible: boolean;
  typeId?: number;
  dataStatus: RequestOptionsType[];
  apiDataTypes: RequestOptionsType[];
  currentType: string;
  currentRow?: ApiColumnItem;
};

/**
 *
 * @param props
 * @constructor
 */
const DataList: React.FC<FormProps> = (props) => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [formVisible, setFormVisible] = useState(false);
  const [row, setRow] = useState<ColumnItem>();
  const [dataStatus, setDataStatus] = useState<RequestOptionsType[]>(props.dataStatus);

  const changeStatus = async (status: number, id: number) => {
    const response = await apiColumn.changeStatus({ id, status });
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
    },
    {
      title: '字段名称',
      dataIndex: 'name',
    },
    {
      title: '数据类型',
      dataIndex: 'data_type',
      valueType: 'select',
      fieldProps: {
        options: [...props.apiDataTypes],
      },
    },
    {
      title: '字段类型',
      dataIndex: 'type',
      search: false,
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '请求', value: 1 },
          { label: '响应', value: 2 },
        ],
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      hideInSearch: true,
      render: (_, record) => {
        return (
          <Switch
            key={record.id}
            onChange={() => changeStatus(record.status == 1 ? 2 : 1, record.id as number)}
            defaultChecked={record.status == 1}
            size={'small'}
          />
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable: true,
      request: _getDataStatusEnum,
    },
    {
      title: '必填',
      dataIndex: 'is_required',
      valueType: 'select',
      fieldProps: {
        options: [
          { label: '是', value: 2 },
          { label: '否', value: 1 },
        ],
      },
    },
    {
      title: '默认值',
      dataIndex: 'default_value',
      search: false,
    },
    {
      title: '字段说明',
      dataIndex: 'description',
      search: false,
      hideInTable: true,
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
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text: any, record: any) => [
        <Button
          className="dropdown-buttons"
          key="permissionGroup"
          type="primary"
          onClick={() => {
            record.type = props.currentType == 'request' ? 1 : 2;
            setRow(record);
            setFormVisible(true);
          }}
          size="small"
          shape='round'
        >
          编辑
        </Button>,
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
        </Popconfirm>,
      ],
    },
  ];

  return (
    <Modal
      open={props.modalVisible}
      footer={null}
      onCancel={() => props.onCancel()}
      width={'100%'}
      style={{ height: '100%' }}
      destroyOnClose={true}
      title={`维护 ${props.currentRow?.name} 的${
        props.currentType == 'request' ? '请求参数' : '响应参数'
      }`}
    >
      {contextHolder}
      <br />
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
        tableAlertOptionRender={() => {
          return (
            <Space size={16}>
              <Button type="link">批量删除</Button>
              <Button type="link">导出数据</Button>
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
          const _type = props.currentType == 'request' ? 1 : 2;

          // 页码
          const _params = {
            api_id: props.currentRow?.id,
            type: _type,
            page: params.current,
            ...params,
          };
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
          <Button
            key="button"
            type="primary"
            shape="round"
            icon={<PlusOutlined />}
            onClick={() => {
              const tmp = { type: props.currentType == 'request' ? 1 : 2 };
              setRow(tmp);
              setFormVisible(true);
            }}
          >
            新建
          </Button>,
        ]}
      />
      <ModalForm
        title={row?.id ? '编辑' : '新增'}
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
          row?.id
            ? row
            : {
                status: 1,
                is_required: 2,
              }
        }
        submitTimeout={2000}
        onFinish={async (values) => {
          let result = null;
          if (row?.id) {
            result = await crud.edit.api(row.id!, { ...row, ...values });
          } else {
            values.api_id = props.currentRow?.id;
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
        <ProFormText name="name" label="字段名称" placeholder="请输入字段名称" />
        <ProFormSelect name="data_type" label="数据类型" options={props.apiDataTypes as any} />
        <ProFormRadio.Group
          name="type"
          label="字段类型"
          options={[
            { label: '请求', value: 1 },
            { label: '响应', value: 2 },
          ]}
        />

        <ProFormRadio.Group name="status" label="状态" request={_getDataStatusEnum} />
        <ProFormRadio.Group
          name="is_required"
          label="必填"
          options={[
            { label: '是', value: 2 },
            { label: '否', value: 1 },
          ]}
        />
        <ProFormItem
          label="字段说明"
          name="description"
        >
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
    </Modal>
  );
};

export default DataList;
