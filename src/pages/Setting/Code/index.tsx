/* eslint-disable no-param-reassign */
import type {
  ActionType,
  EditableFormInstance,
  ProColumns,
  ProFormInstance,
} from "@ant-design/pro-components";
import {
  DrawerForm,
  EditableProTable,
  ModalForm,
  PageContainer,
  ProCard,
  ProFormCascader,
  ProFormCheckbox,
  ProFormDependency,
  ProFormDigit,
  ProFormGroup,
  ProFormList,
  ProFormRadio,
  ProFormSegmented,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from "@ant-design/pro-components";
import {
  Alert,
  Button,
  Divider,
  Drawer,
  Dropdown,
  Input,
  message as Message,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
} from "antd";
import type { DefaultOptionType } from "antd/es/cascader";
import React, { useRef, useState } from "react";

import common from "@/services/api/common";
import generate from "@/services/api/setting/generate";
import dataMaintain from "@/services/api/system/dataMaintain";
import { dictType } from "@/services/api/system/dict";
import menu from "@/services/api/system/menu";
import tool from "@/services/tool";
import {
  ApiOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  CoffeeOutlined,
  CopyOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  FileSyncOutlined,
  FolderAddOutlined,
  ImportOutlined,
  StopOutlined,
} from "@ant-design/icons";

import Editor from "@monaco-editor/react";
import copy from "copy-to-clipboard";

import settingDatasource from "@/services/api/setting/settingDatasource";
import { menuList, queryType, realtionsType, viewComponent } from "./vars";

type ColumnItem = {
  id: number; //1,
  table_name: string; // "system_api",
  table_comment: string; //"接口表",
  module_name: string; //null,
  namespace: string; //null,
  menu_name: string; //"接口表",
  belong_menu_id: number; //null,
  package_name: string; //null,
  type: string; //"single",
  generate_type: number; //1,
  generate_menus: string; //null,
  build_menu: number; //1,
  component_type: number; //1,
  options: string; //null,
  created_by: number; // 1,
  updated_by: number; //1,
  created_at: string; //"2022-12-05 08:47:30",
  updated_at: string; //"2022-12-05 08:47:30",
  remark: string; //null
};

type TableItem = {
  name: string; //"country_info",
  engine: string; //"InnoDB",
  version: number; //10,
  row_format: string; //"Dynamic",
  rows: number; //242,
  avg_row_length: number; //67,
  data_length: number; //16384,
  max_data_length: number; //0,
  index_length: number; //0,
  data_free: number; // 0,
  auto_increment: number; //243,
  create_time: string; //"2022-12-12 11:21:45",
  update_time: string; //null,
  check_time: string; //null,
  collation: string; //"utf8_general_ci",
  checksum: number; //null,
  create_options: number; //"",
  comment: string; //"国家数据表"
};

type CodeItem = {
  tab_name: string; //"Controller.php",
  name: string; //"controller",
  code: string; //"<?php\r\ndeclare(strict_types=1);...",
  lang: string; //"php"
};

type DataSourceType = {
  id: number; //1,
  table_id: number; //1,
  column_name: string; //"id",
  column_comment: string; //"主键",
  column_type: string; //"bigint",
  is_pk: number; //2,
  is_required: number; //1,
  is_insert: number; //1,
  is_edit: number; //1,
  is_list: number; //1,
  is_query: number; //1,
  is_sort: number; //1,
  query_type: string; //"eq",
  view_type: string; //"text",
  dict_type: string; // null,
  allow_roles: any; //null,
  options: object; //null,
  sort: number; //17,
  created_by: number; //1,
  updated_by: number; //1,
  created_at: string; //"2022-12-05 08:47:31",
  updated_at: string; //"2022-12-05 08:47:31",
  remark: string; //null
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const configFormRef = useRef<ProFormInstance>();
  const [configFormVisible, setConfigFormVisible] = useState<boolean>(false);
  const [row, setRow] = useState<ColumnItem>();

  const [source, setSource] = useState<string>("MsProAdmin");
  const [loadExternalSource, setLoadExternalSource] = useState<boolean>(false);
  const loadTableRef = useRef<ActionType>();
  const [loadTableVisible, setLoadTableVisible] = useState<boolean>(false);
  const [newNames, setNewNames] = useState<Record<React.Key, string>>({});
  const [newComments, setNewComments] = useState<Record<React.Key, string>>({});

  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewDatas, setPreviewDatas] = useState<CodeItem[]>([]);

  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<readonly DataSourceType[]>([]);

  const columns: ProColumns<ColumnItem>[] = [
    {
      title: "表名称",
      dataIndex: "table_name",
    },
    {
      title: "表描述",
      dataIndex: "table_comment",
    },

    {
      title: "生成类型",
      dataIndex: "type",
      hideInSearch: true,
      valueEnum: {
        single: "单表CRUD",
        tree: "树表CRUD",
      },
    },
    {
      title: "创建时间",
      key: "created_at",
      dataIndex: "created_at",
      valueType: "dateTime",
      sorter: true,
      hideInSearch: true,
    },
    {
      title: "更新时间",
      key: "updated_at",
      dataIndex: "updated_at",
      valueType: "dateTime",
      sorter: true,
      defaultSortOrder: "descend",
      hideInSearch: true,
    },
    {
      title: "操作",
      valueType: "option",
      key: "option",
      width: 150,
      render: (_: any, record: any) => [
        <Dropdown.Button
          className="dropdown-buttons"
          key="permissionGroup"
          type="primary"
          menu={{
            items: [
              {
                key: "synchronous",
                label: "同步字段",
                icon: <FileSyncOutlined />,
              },
              { key: "preview", label: "预览代码", icon: <CoffeeOutlined /> },
              { key: "generate", label: "生成代码", icon: <CodeOutlined /> },
            ],
            onClick: async ({ key }) => {
              if (key === "preview") {
                setRow(record);
                message.loading("数据加载中...");
                const response = await generate.preview({ id: record.id });
                if (!response.success) {
                  message.error(response.message);
                  return;
                }
                message.destroy();
                setPreviewDatas(response.data);
                setPreviewVisible(true);
              }
              if (key === "synchronous") {
                Modal.confirm({
                  title: "确认",
                  content: "同步会重置字段配置生成信息，确定同步吗?",
                  onOk: async () => {
                    const response = await generate.sync(record.id);
                    if (!response.success) {
                      message.error(response.message);
                      return;
                    }
                    message.success(response.message);
                  },
                });
              }
              if (key === "generate") {
                message.info("代码生成下载中，请稍后");
                const response = await generate.generateCode({
                  ids: [record.id],
                });
                if (response.data.type === "application/json") {
                  const reader = new FileReader();
                  reader.readAsText(response.data, "utf-8");
                  reader.onload = function () {
                    const t = JSON.parse(reader.result as string); // 这里就得到了json
                    message.error(t.message);
                  };
                  return;
                }
                tool.download(response);
                message.success("代码生成成功，开始下载");
              }
            },
          }}
          onClick={async () => {
            message.loading("数据加载中...");
            const rowData = { ...record };
            if (rowData.belong_menu_id > 0) {
              const result = await menu.getList({ id: rowData.belong_menu_id });
              if (result.success) {
                const levels = result.data[0].level.split(",");
                levels.shift();
                levels.push(rowData.belong_menu_id);
                rowData.belong_menu_id = levels.map((item: any) =>
                  Number(item)
                );
              }
            }
            if (rowData.generate_menus) {
              rowData.generate_menus = rowData.generate_menus.split(",");
            } else {
              rowData.generate_menus = [
                "save",
                "update",
                "read",
                "delete",
                "recycle",
                "changeStatus",
                "numberOperation",
                "import",
                "export",
              ];
            }
            setRow(rowData);
            const response = await generate.getTableColumns({
              table_id: record.id,
            });
            if (response.success) {
              setDataSource(
                response.data.map((item: DataSourceType) => ({
                  ...item,
                  is_required: item.is_required === 2,
                  is_insert: item.is_insert === 2,
                  is_edit: item.is_edit === 2,
                  is_list: item.is_list === 2,
                  is_query: item.is_query === 2,
                  is_sort: item.is_sort === 2,
                  dict_type: !Boolean(item.dict_type)
                    ? undefined
                    : item.dict_type,
                  allow_roles: !Boolean(item.allow_roles)
                    ? []
                    : item.allow_roles
                        .split(",")
                        .map((sub: string) => Number(sub)),
                }))
              );
              setEditableRowKeys(
                response.data.map((item: DataSourceType) => item.id)
              );
            }
            setConfigFormVisible(true);
            message.destroy();
          }}
          size="small"
        >
          配置
        </Dropdown.Button>,
        <Popconfirm
          key="popconfirm"
          title="确定要删除吗？"
          onConfirm={async () => {
            const result = await generate.deletes({ ids: [record.id] });
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

  const tableColumns: ProColumns<TableItem>[] = [
    {
      title: "序号",
      valueType: "index",
    },
    {
      title: "表名称",
      dataIndex: "name",
    },
    {
      title: "表名称(新)",
      dataIndex: "new_name",
      hideInTable: source === "MsProAdmin" || !loadExternalSource,
      render: (_, record) => (
        <Space.Compact>
          <Input
            width={120}
            value={newNames[record.name]}
            onChange={(e) => {
              setNewNames({ ...newNames, [record.name]: e.target.value });
            }}
          />
          <Tooltip title={"复制原表名称"}>
            <Button
              onClick={() => {
                setNewNames({ ...newNames, [record.name]: record.name });
              }}
              icon={<CopyOutlined />}
            />
          </Tooltip>
        </Space.Compact>
      ),
    },
    {
      title: "表描述",
      dataIndex: "comment",
      hideInSearch: true,
    },
    {
      title: "表描述(新)",
      dataIndex: "new_comment",
      hideInSearch: true,
      hideInTable: source === "MsProAdmin" || !loadExternalSource,
      render: (_, record) => (
        <Space.Compact>
          <Input
            width={120}
            value={newComments[record.name]}
            onChange={(e) => {
              setNewComments({ ...newComments, [record.name]: e.target.value });
            }}
          />
          <Tooltip title={"复制原表描述"}>
            <Button
              onClick={() => {
                setNewComments({
                  ...newComments,
                  [record.name]: record.comment,
                });
              }}
              icon={<CopyOutlined />}
            />
          </Tooltip>
        </Space.Compact>
      ),
    },
    {
      title: "记录数",
      dataIndex: "rows",
      hideInSearch: true,
    },
    {
      title: "创建时间",
      dataIndex: "create_time",
      valueType: "dateTime",
      hideInSearch: true,
    },
  ];

  const notNeedSettingComponents = [
    "text",
    "password",
    "textarea",
    "formGroup",
    "inputTag",
    "mention",
    "userInfo",
    "country",
  ];
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const fieldColumns: ProColumns<DataSourceType>[] = [
    {
      title: "排序",
      width: 80,
      dataIndex: "sort",
      fieldProps: { allowClear: false },
    },
    { title: "字段名称", width: 150, dataIndex: "column_name", readonly: true },
    {
      title: "字段描述",
      width: 120,
      dataIndex: "column_comment",
      fieldProps: { allowClear: false },
      formItemProps: {
        rules: [
          {
            required: true,
            whitespace: true,
            message: "此项是必填项",
          },
          {
            max: 16,
            whitespace: true,
            message: "最长为 16 位",
          },
          {
            min: 2,
            whitespace: true,
            message: "最小为 2 位",
          },
        ],
      },
    },
    { title: "物理类型", width: 120, dataIndex: "column_type", readonly: true },
    {
      title: "必填",
      width: 80,
      dataIndex: "is_required",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "插入",
      width: 80,
      dataIndex: "is_insert",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "编辑",
      width: 80,
      dataIndex: "is_edit",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "列表",
      width: 80,
      dataIndex: "is_list",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "查询",
      width: 80,
      dataIndex: "is_query",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "排序",
      width: 80,
      dataIndex: "is_sort",
      valueType: "switch",
      fieldProps: { size: "small" },
    },
    {
      title: "查询方式",
      width: 120,
      dataIndex: "query_type",
      valueType: "select",
      fieldProps: {
        options: queryType,
      },
    },
    {
      title: "页面控件",
      width: 150,
      dataIndex: "view_type",
      valueType: "select",
      fieldProps: {
        options: viewComponent,
      },
    },
    {
      title: "参数",
      width: 80,
      dataIndex: "options",
      dependencies: ["view_type"],
      renderFormItem: (_, { record }) => {
        return !notNeedSettingComponents.includes(record?.view_type ?? "") ? (
          <ModalForm
            title={`设置组件 - ${record?.column_comment}`}
            width={400}
            trigger={
              <Button type="link" style={{ padding: 0 }}>
                配置
              </Button>
            }
            modalProps={{
              destroyOnClose: true,
            }}
            grid
            request={async () =>
              record?.options ?? {
                min: undefined,
                max: undefined,
                step: 1,
                precision: 2,
                showTicks: false,
                checkedValue: "开启",
                uncheckedValue: "关闭",
                multiple: false,
                height: 500,
                onlyData: true,
                returnType: "id",
                multipleUpload: false,
                chunk: false,
                onlyId: true,
                pickerType: "date",
                showTime: false,
                pickerRange: false,
              }
            }
            onFinish={async (values: any) => {
              editorFormRef.current?.setRowData?.(record?.id as any, {
                options: values,
              });
              return true;
            }}
          >
            {/* <!-- 数字输入框 / 滑块 --> */}
            {["inputNumber", "slider"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormDigit label="最小值" name="min" />
                <ProFormDigit label="最大值" name="max" />
                <ProFormDigit label="步长" name="step" />
                {["inputNumber"].includes(record?.view_type ?? "") && (
                  <ProFormDigit label="精度" name="precision" />
                )}
                {["slider"].includes(record?.view_type ?? "") && (
                  <ProFormRadio.Group
                    label="刻度线"
                    name="showTicks"
                    options={[
                      { label: "显示", value: true },
                      { label: "不显示", value: false },
                    ]}
                  />
                )}
              </ProFormGroup>
            )}
            {/* <!-- 开关 --> */}
            {["switch"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormText
                  label="选中时的值"
                  name="checkedChildren"
                  rules={[{ required: true, message: "该项必填" }]}
                />
                <ProFormText
                  label="未选中时的值"
                  name="unCheckedChildren"
                  rules={[{ required: true, message: "该项必填" }]}
                />
              </ProFormGroup>
            )}
            {/* <!-- 下拉、复选、单选 --> */}
            {["select", "checkbox", "radio", "transfer"].includes(
              record?.view_type ?? ""
            ) && (
              <ProFormGroup>
                {["select"].includes(record?.view_type ?? "") && (
                  <>
                    <ProFormRadio.Group
                      label="复选"
                      name="multiple"
                      options={[
                        { label: "是", value: true },
                        { label: "否", value: false },
                      ]}
                      rules={[{ required: true, message: "该项必选" }]}
                    />
                    <ProFormRadio.Group
                      label="允许搜索"
                      name="showSearch"
                      options={[
                        { label: "是", value: true },
                        { label: "否", value: false },
                      ]}
                      rules={[{ required: true, message: "该项必选" }]}
                    />
                  </>
                )}
                <ProFormList
                  creatorRecord={{
                    label: undefined,
                    value: undefined,
                  }}
                  min={0}
                  name="options"
                  label="设置数据"
                >
                  <ProFormGroup key="group">
                    <ProFormText
                      colProps={{ span: 10 }}
                      label="名称"
                      name="label"
                      placeholder="请输入"
                      rules={[{ required: true, message: "该项必填" }]}
                    />
                    <ProFormText
                      colProps={{ span: 14 }}
                      label="值"
                      name="value"
                      placeholder="请输入"
                      rules={[{ required: true, message: "该项必填" }]}
                    />
                  </ProFormGroup>
                </ProFormList>
              </ProFormGroup>
            )}
            {/* <!-- 树形下拉框、级联选择器 --> */}
            {["treeSelect", "cascader"].includes(record?.view_type ?? "") && (
              <Alert
                showIcon
                message={
                  <span>
                    该组件涉及多层数据嵌套，请看
                    <a
                      href="https://procomponents.ant.design/components/field-set#proformtreeselect"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Antd Pro 官方文档
                    </a>
                  </span>
                }
              />
            )}
            {/* <!-- 编辑器相关 --> */}
            {["codeEditor", "editor"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormDigit
                  label="编辑器高度"
                  name="height"
                  min={100}
                  max={1000}
                  rules={[{ required: true, message: "该项必填" }]}
                />
              </ProFormGroup>
            )}
            {/* <!-- 上传、资源选择器相关 --> */}
            {["upload", "selectResource"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormRadio.Group
                  label="返回数据"
                  name="onlyData"
                  options={[
                    { label: "单个字段数据", value: true },
                    { label: "全量数据", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
                <ProFormDependency name={["onlyData"]}>
                  {({ onlyData }) =>
                    onlyData && (
                      <ProFormSelect
                        label="指定数据"
                        tooltip="支持 uploadfile 数据表所有字段，这里仅列常用部分"
                        name="returnType"
                        options={[
                          { label: "附件URL", value: "url" },
                          { label: "附件ID", value: "id" },
                          { label: "附件HASH", value: "hash" },
                        ]}
                        rules={[{ required: true, message: "该项必选" }]}
                      />
                    )
                  }
                </ProFormDependency>
                <ProFormRadio.Group
                  label="是否可多选"
                  name="multiple"
                  options={[
                    { label: "是", value: true },
                    { label: "否", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
                <ProFormRadio.Group
                  label="是否分片上传"
                  tooltip="分片上传不限制文件类型，选择分片上传后，上传文件类型则失效"
                  name="chunk"
                  options={[
                    { label: "是", value: true },
                    { label: "否", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
                <ProFormDependency name={["chunk"]}>
                  {({ chunk }) =>
                    !chunk &&
                    ["upload"].includes(record?.view_type ?? "") && (
                      <ProFormSelect
                        label="上传类型"
                        tooltip="可在 系统配置 -> 上传配置 里修改允许格式"
                        name="type"
                        options={[
                          { label: "图片格式类型", value: "image" },
                          { label: "非图片格式类型", value: "file" },
                        ]}
                        rules={[{ required: true, message: "该项必选" }]}
                      />
                    )
                  }
                </ProFormDependency>
              </ProFormGroup>
            )}
            {/* <!-- 用户选择器 --> */}
            {["selectUser"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormRadio.Group
                  label="返回数据"
                  name="onlyId"
                  options={[
                    { label: "仅用户ID", value: true },
                    { label: "全量数据", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
              </ProFormGroup>
            )}
            {/* <!-- 省市区联动 --> */}
            {["cityLinkage"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <Alert
                  showIcon
                  message="级联选择器返回的数据类型为 String；下拉框联动返回的数据类型为 Array"
                />
                <ProFormSelect
                  label="组件类型"
                  name="type"
                  options={[
                    { label: "下拉框联动", value: "select" },
                    { label: "级联选择器", value: "cascader" },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
              </ProFormGroup>
            )}
            {/* <!-- 日期、时间选择器 --> */}
            {["time", "date"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                {["date"].includes(record?.view_type ?? "") && (
                  <>
                    <ProFormSelect
                      label="选择器类型"
                      name="type"
                      options={[
                        { label: "日期选择器", value: "Date" },
                        { label: "周选择器", value: "Week" },
                        { label: "月选择器", value: "Month" },
                        { label: "季度选择器", value: "Quarter" },
                        { label: "年选择器", value: "Year" },
                      ]}
                      rules={[{ required: true, message: "该项必选" }]}
                    />
                    <ProFormDependency name={["type"]}>
                      {({ type }) =>
                        type === "Date" && (
                          <ProFormRadio.Group
                            label="是否显示时间"
                            name="showTime"
                            options={[
                              { label: "是", value: true },
                              { label: "否", value: false },
                            ]}
                            rules={[{ required: true, message: "该项必选" }]}
                          />
                        )
                      }
                    </ProFormDependency>
                  </>
                )}
                <ProFormRadio.Group
                  label="是否范围选择"
                  name="range"
                  options={[
                    { label: "是", value: true },
                    { label: "否", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                />
              </ProFormGroup>
            )}
            {/* 评分 */}
            {["rate"].includes(record?.view_type ?? "") && (
              <ProFormGroup>
                <ProFormDigit
                  label="Star 总数"
                  name="starCount"
                  min={2}
                  initialValue={5}
                />
                <ProFormDigit
                  label="默认值"
                  name="defaultStar"
                  initialValue={3}
                />
                <ProFormRadio.Group
                  label="是否允许清除"
                  name="allowClear"
                  options={[
                    { label: "是", value: true },
                    { label: "否", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                  initialValue={true}
                />
                <ProFormRadio.Group
                  label="是否允许半选"
                  name="allowHalf"
                  options={[
                    { label: "是", value: true },
                    { label: "否", value: false },
                  ]}
                  rules={[{ required: true, message: "该项必选" }]}
                  initialValue={false}
                />
              </ProFormGroup>
            )}
          </ModalForm>
        ) : (
          <Button type="link" disabled style={{ padding: 0 }}>
            -
          </Button>
        );
      },
    },
    {
      title: "数据字典",
      dataIndex: "dict_type",
      width: 150,
      valueType: "select",
      request: async () => {
        const response = await dictType.getOption();
        return response.data;
      },
      fieldProps: (form, { rowKey }) => {
        return {
          fieldNames: { label: "name", value: "code" },
          disabled: !["select", "radio", "checkbox", "transfer"].includes(
            form.getFieldValue([rowKey || "", "view_type"])
          ),
        };
      },
    },
    {
      title: "数据查看角色",
      dataIndex: "allow_roles",
      valueType: "select",
      fieldProps: {
        mode: "multiple",
        fieldNames: { label: "name", value: "id" },
      },
      request: async () => {
        const response = await common.getRoleList();
        return response.data;
      },
    },
  ];

  return (
    <PageContainer
      header={{
        breadcrumb: {
          items: [
            {
              path: "",
              title: "工具",
            },
            {
              path: "",
              title: "代码生成器",
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
            <Button
              type="link"
              style={{ marginInlineStart: 8 }}
              onClick={onCleanSelected}
            >
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
                  const msg = await generate.deletes({ ids: selectedRowKeys });
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
              <Button
                type="link"
                onClick={async () => {
                  message.info("代码生成下载中，请稍后");
                  const response = await generate.generateCode({
                    ids: selectedRowKeys,
                  });
                  if (response.data.type === "application/json") {
                    const reader = new FileReader();
                    reader.readAsText(response.data, "utf-8");
                    reader.onload = function () {
                      const t = JSON.parse(reader.result as string); // 这里就得到了json
                      message.error(t.message);
                    };
                    return;
                  }
                  tool.download(response);
                  message.success("代码生成成功，开始下载");
                }}
              >
                生成代码
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
              orderType: Object.values(sort)[0] == "ascend" ? "asc" : "desc",
            };
          }
          // 页码
          params = { page: params.current, ...params };
          delete params.current;

          const result = await generate.getPageList({
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
          persistenceKey: window.location.pathname.replaceAll("/", "_"),
          persistenceType: "localStorage",
        }}
        rowKey="id"
        search={{
          labelWidth: "auto",
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
            icon={<ImportOutlined />}
            onClick={() => setLoadTableVisible(true)}
          >
            装载数据表
          </Button>,
        ]}
      />
      <Modal
        title="装载数据表"
        width={1200}
        open={loadTableVisible}
        onCancel={() => setLoadTableVisible(false)}
        destroyOnClose
        footer={false}
      >
        <Alert
          type={"info"}
          showIcon={true}
          message={
            "非系统数据源，载入表时，会同步远程的表结构到本地数据库。建议重新命名表名称和表注释。但需要注意表名称的规范"
          }
          closable={true}
          style={{ marginBlockEnd: 24 }}
        />
        <ProTable<TableItem>
          columns={tableColumns}
          actionRef={loadTableRef}
          cardBordered
          rowSelection={{
            // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
            defaultSelectedRowKeys: [],
          }}
          tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
            <span>
              已选 {selectedRowKeys.length} 项
              <Button
                type="link"
                style={{ marginInlineStart: 8 }}
                onClick={onCleanSelected}
              >
                取消选择
              </Button>
            </span>
          )}
          tableAlertOptionRender={({ selectedRows }) => {
            return (
              <Space size={16}>
                <Button
                  size="small"
                  type="primary"
                  onClick={async () => {
                    message.loading("正在装载");
                    const names = selectedRows.map((item: TableItem) => ({
                      name: newNames[item.name] ?? item.name,
                      comment: newComments[item.name] ?? item.comment,
                      sourceName: item.name,
                    }));
                    const response = await generate.loadTable({
                      names,
                      source,
                    });
                    if (response.message && !response.success) {
                      message.error(response.message);
                    } else {
                      message.success("数据表装载成功");
                      setLoadTableVisible(false);
                      actionRef.current?.reload();
                    }
                  }}
                  icon={<ImportOutlined />}
                >
                  装载选择的表
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
                orderType: Object.values(sort)[0] == "ascend" ? "asc" : "desc",
              };
            }
            // 页码
            params = { page: params.current, ...params };
            delete params.current;
            const api =
              source === "MsProAdmin"
                ? dataMaintain.getPageList
                : settingDatasource.getDataSourceTablePageList;
            params.id = source === "MsProAdmin" ? undefined : source;
            const result = await api({
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
            persistenceKey:
              window.location.pathname.replaceAll("/", "_") + "_load_tables",
            persistenceType: "localStorage",
          }}
          rowKey="name"
          search={{
            labelWidth: "auto",
          }}
          options={{
            density: true,
            setting: false,
          }}
          pagination={{
            showSizeChanger: true,
            defaultPageSize: 20,
          }}
          dateFormatter="string"
          headerTitle={
            <Space.Compact>
              <ProFormSelect
                width={200}
                noStyle={true}
                request={async () => {
                  const response = await generate.getDataSourceList();
                  return [
                    { label: "系统数据源", value: "MsProAdmin" },
                    ...response.data,
                  ];
                }}
                allowClear={false}
                onChange={(value) => setSource(value as string)}
                fieldProps={{ defaultValue: "MsProAdmin" }}
              />
              <Button
                type={"primary"}
                onClick={() => {
                  setLoadExternalSource(true);
                  loadTableRef.current?.reloadAndRest?.();
                }}
              >
                切换数据源
              </Button>
            </Space.Compact>
          }
          size={"small"}
        />
      </Modal>
      <Drawer
        title={`预览代码 - ${row?.table_comment}`}
        width={"calc(100vw - 256px)"}
        open={previewVisible}
        onClose={() => {
          setPreviewVisible(false);
          setRow(undefined);
        }}
        destroyOnClose
        footer={false}
        bodyStyle={{ paddingBlock: 0 }}
      >
        <ProCard
          tabs={{
            tabPosition: "top",
            items: previewDatas.map((item: CodeItem) => ({
              label: item.tab_name,
              key: item.name,
              children: (
                <>
                  <Editor
                    height={"calc(100vh - 145px)"}
                    defaultLanguage={item.lang}
                    defaultValue={item.code}
                    options={{
                      readOnly: true,
                      tabSize: 2,
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      autoIndent: true,
                      minimap: { enabled: false },
                      folding: true,
                      acceptSuggestionOnCommitCharacter: true,
                      acceptSuggestionOnEnter: true,
                      contextmenu: true,
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    style={{ position: "absolute", top: 20, right: 40 }}
                    onClick={() => {
                      if (copy(item.code)) message.success("复制到剪贴板成功");
                      else message.error("复制失败");
                    }}
                  >
                    复制
                  </Button>
                </>
              ),
            })),
          }}
        />
      </Drawer>
      <DrawerForm
        title={`配置生成信息 - ${row?.table_comment}`}
        open={configFormVisible}
        onOpenChange={(open) => setConfigFormVisible(open)}
        width={"calc(100vw - 256px)"}
        formRef={configFormRef}
        drawerProps={{
          maskClosable: false,
          destroyOnClose: true,
          onClose: () => {
            setRow(undefined);
            configFormRef.current?.resetFields([
              "table_name",
              "table_comment",
              "type",
              "package_name",
              "menu_name",
              "generate_type",
              "generate_menus",
              "component_type",
            ]);
          },
        }}
        request={async () => row ?? {}}
        submitTimeout={2000}
        onFinish={async (values) => {
          const data = { ...row, ...values };
          data.columns = dataSource.map((item: DataSourceType) => ({
            ...item,
            ...editorFormRef.current?.getRowData?.(item.id),
            dict_type:
              editorFormRef.current?.getRowData?.(item.id)?.dict_type ?? "",
            allow_roles:
              editorFormRef.current
                ?.getRowData?.(item.id)
                ?.allow_roles?.join(",") ?? "",
          }));
          const response = await generate.update(data);
          if (response.success) {
            message.success("提交成功");
            configFormRef.current?.resetFields([
              "table_name",
              "table_comment",
              "type",
              "package_name",
              "menu_name",
              "generate_type",
              "generate_menus",
              "component_type",
            ]);
            setRow(undefined);
            setConfigFormVisible(false);
            actionRef.current?.reload();
            return true;
          } else {
            message.error(response.message);
            return false;
          }
        }}
        grid={true}
        className="custom-modal-form"
      >
        <ProCard
          tabs={{
            tabPosition: "top",
            items: [
              {
                label: "基本配置",
                key: "basic",
                children: (
                  <ProFormGroup grid={true} rowProps={{ gutter: 16 }}>
                    <Divider orientation="left" plain>
                      基础信息
                    </Divider>
                    <ProFormText
                      colProps={{ span: 12 }}
                      name="table_name"
                      label="表名称"
                      placeholder="请输入表名称"
                      rules={[{ required: true, message: "请输入表名称" }]}
                      disabled={true}
                    />
                    <ProFormText
                      colProps={{ span: 12 }}
                      name="table_comment"
                      label="表描述"
                      placeholder="请输入表描述"
                      rules={[{ required: true, message: "请输入表描述" }]}
                    />
                    <ProFormTextArea
                      colProps={{ span: 24 }}
                      name="remark"
                      label="备注信息"
                    />
                    <Divider orientation="left" plain>
                      生成信息
                    </Divider>
                    <ProFormSelect
                      colProps={{ span: 8 }}
                      name="module_name"
                      label="所属模块"
                      placeholder="请选择所属模块，键入模块名搜索"
                      rules={[{ required: true, message: "请选择所属模块" }]}
                      request={async () => {
                        const response = await common.getModuleList();
                        if (response.success) {
                          return Object.values(response.data).map(
                            (item: any) => ({
                              label: `${item.name} - ${item.label}`,
                              value: item.name,
                            })
                          );
                        }
                        return [];
                      }}
                      showSearch
                      fieldProps={{
                        optionFilterProp: "children",
                        filterOption: (input, option: any) =>
                          (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase()),
                      }}
                      extra="所属模块请对应表模块前缀，否则会生成失败，且在安装模块时，数据迁移文件会被忽略"
                    />
                    <ProFormCascader
                      colProps={{ span: 8 }}
                      name="belong_menu_id"
                      label="所属菜单"
                      placeholder="生成功能模块所属菜单"
                      rules={[{ required: false, message: "请选择所属菜单" }]}
                      request={async () => {
                        const response = await menu.tree({ onlyMenu: true });
                        if (response.success) {
                          return [
                            { label: "顶级菜单", value: 0 },
                            ...response.data,
                          ];
                        }
                        return [];
                      }}
                      fieldProps={{
                        changeOnSelect: true,
                        expandTrigger: "hover",
                        showSearch: {
                          filter: (
                            inputValue: string,
                            path: DefaultOptionType[]
                          ) =>
                            path.some(
                              (option) =>
                                (option.label as string)
                                  .toLowerCase()
                                  .indexOf(inputValue.toLowerCase()) > -1
                            ),
                        },
                      }}
                      extra="分配业务功能在哪个菜单，例如：权限管理。不选择则为顶级菜单"
                    />
                    <ProFormText
                      colProps={{ span: 8 }}
                      name="menu_name"
                      label="菜单名称"
                      placeholder="请填写菜单名称"
                      rules={[{ required: true, message: "请填写菜单名称" }]}
                      extra="显示在左侧菜单上的名称、以及以及代码中的业务名称"
                    />
                    <ProFormSelect
                      colProps={{ span: 12 }}
                      name="type"
                      label="生成类型"
                      placeholder="请选择生成类型"
                      rules={[{ required: true, message: "请选择生成类型" }]}
                      request={async () => [
                        { label: "单表增删改查", value: "single" },
                        { label: "树表增删改查", value: "tree" },
                      ]}
                      extra="单表须有主键，树表须指定id、parent_id、name等字段"
                    />
                    <ProFormText
                      colProps={{ span: 12 }}
                      name="package_name"
                      label="包名"
                      placeholder="请填写包名"
                      rules={[{ required: false, message: "请填写包名" }]}
                      extra="指定控制器文件所在控制器目录的二级目录名，如：Premission"
                    />
                    <ProFormSegmented
                      colProps={{ span: 8 }}
                      name="generate_type"
                      label="生成方式"
                      request={async () => [
                        {
                          label: "压缩包下载",
                          value: 1,
                          icon: <DownloadOutlined />,
                        },
                        {
                          label: "生成到目录",
                          value: 2,
                          icon: <FolderAddOutlined />,
                        },
                      ]}
                      rules={[{ required: true, message: "请选择生成方式" }]}
                      extra="如选择生成到目录，只会对后端文件进行到目录生成（覆盖形式），前端文件和菜单SQL还以压缩包方式下载"
                      disabled={true}
                    />
                    <ProFormSegmented
                      colProps={{ span: 8 }}
                      name="component_type"
                      label="组件样式"
                      request={async () => [
                        {
                          label: "模态框(Modal)",
                          value: 1,
                          icon: <CreditCardOutlined />,
                        },
                        {
                          label: "抽屉(Drawer)",
                          value: 2,
                          icon: <DatabaseOutlined />,
                        },
                      ]}
                      rules={[{ required: true, message: "组件样式" }]}
                      extra="设置新增和修改组件显示方式"
                    />
                    <ProFormSegmented
                      colProps={{ span: 8 }}
                      name="build_menu"
                      label="构建菜单"
                      request={async () => [
                        {
                          label: "不构建菜单",
                          value: 1,
                          icon: <StopOutlined />,
                        },
                        {
                          label: "构建菜单",
                          value: 2,
                          icon: <CheckCircleOutlined />,
                        },
                      ]}
                      rules={[
                        { required: true, message: "请选择构建菜单方式" },
                      ]}
                      extra="如选择构建菜单，在每次生成代码都会进行生成菜单操作。"
                      disabled={true}
                    />
                    <ProFormDependency name={["type"]}>
                      {({ type }) =>
                        type === "tree" && (
                          <>
                            <Divider orientation="left" plain>
                              其他信息
                            </Divider>
                            <ProFormSelect
                              colProps={{ span: 8 }}
                              name="tree_id"
                              label="树主ID"
                              placeholder="请选择树主ID"
                              rules={[
                                { required: true, message: "请选择树主ID" },
                              ]}
                              request={async () =>
                                dataSource.map((item: DataSourceType) => ({
                                  label:
                                    item.column_name +
                                    " - " +
                                    item.column_comment,
                                  value: item.column_name,
                                }))
                              }
                              showSearch
                              fieldProps={{
                                optionFilterProp: "children",
                                filterOption: (input, option: any) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase()),
                              }}
                              extra="指定树表的主要ID，一般为主键"
                            />
                            <ProFormSelect
                              colProps={{ span: 8 }}
                              name="tree_parent_id"
                              label="树父ID"
                              placeholder="请选择树父ID"
                              rules={[
                                { required: true, message: "请选择树父ID" },
                              ]}
                              request={async () =>
                                dataSource.map((item: DataSourceType) => ({
                                  label:
                                    item.column_name +
                                    " - " +
                                    item.column_comment,
                                  value: item.column_name,
                                }))
                              }
                              showSearch
                              fieldProps={{
                                optionFilterProp: "children",
                                filterOption: (input, option: any) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase()),
                              }}
                              extra="指定树表的父ID，比如：parent_id"
                            />
                            <ProFormSelect
                              colProps={{ span: 8 }}
                              name="tree_name"
                              label="树名称"
                              placeholder="请选择树名称"
                              rules={[
                                { required: true, message: "请选择树名称" },
                              ]}
                              request={async () =>
                                dataSource.map((item: DataSourceType) => ({
                                  label:
                                    item.column_name +
                                    " - " +
                                    item.column_comment,
                                  value: item.column_name,
                                }))
                              }
                              showSearch
                              fieldProps={{
                                optionFilterProp: "children",
                                filterOption: (input, option: any) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase()),
                              }}
                              extra="指定树显示的名称字段，比如：name"
                            />
                          </>
                        )
                      }
                    </ProFormDependency>
                  </ProFormGroup>
                ),
              },
              {
                label: "字段配置",
                key: "field",
                children: (
                  <>
                    <Alert
                      showIcon
                      type="info"
                      message={
                        <span>
                          使用数组形式字段的组件，请在模型的{" "}
                          <Tag color="#f50">casts</Tag>
                          设置相应字段为 <Tag color="#f50">array</Tag>
                          类型，数据字典在页面控件为下拉框、单选框、复选框和数据穿梭框才生效
                        </span>
                      }
                      style={{ marginBlockEnd: 10 }}
                    />
                    <EditableProTable<DataSourceType>
                      editableFormRef={editorFormRef}
                      headerTitle=""
                      columns={fieldColumns}
                      rowKey="id"
                      value={dataSource}
                      onChange={setDataSource}
                      recordCreatorProps={false}
                      editable={{
                        type: "multiple",
                        editableKeys,
                        // onValuesChange: (record, recordList) => {
                        //   setDataSource(recordList);
                        // },
                        onChange: setEditableRowKeys,
                      }}
                      className="custom-edittable"
                    />
                  </>
                ),
              },
              {
                label: "菜单配置",
                key: "menu",
                children: (
                  <>
                    <Alert
                      showIcon
                      type="info"
                      message="未选择的菜单，后端也对应不生成方法。注意：列表按钮菜单是默认的"
                      style={{ marginBlockEnd: 10 }}
                    />
                    <ProFormCheckbox.Group
                      label=""
                      name="generate_menus"
                      layout="vertical"
                      request={async () =>
                        menuList.map((item: any) => ({
                          label: `${item.label} - ${item.comment}`,
                          value: item.value,
                        }))
                      }
                    />
                  </>
                ),
              },
              {
                label: "关联配置",
                key: "relation",
                children: (
                  <>
                    <Alert
                      showIcon
                      type="info"
                      message="模型关联支持：一对一、一对多、一对多（反向）、多对多。"
                      style={{ marginBlockEnd: 10 }}
                    />
                    <ProFormList
                      min={0}
                      name={["options", "relations"]}
                      label=""
                      creatorButtonProps={{
                        creatorButtonText: "新增关联",
                        icon: <ApiOutlined />,
                      }}
                      creatorRecord={{
                        name: "",
                        type: "hasOne",
                        model: "",
                        foreignKey: "",
                        localKey: "",
                        table: "",
                      }}
                      copyIconProps={false}
                      alwaysShowItemLabel={true}
                      itemContainerRender={(doms) => {
                        return (
                          <div
                            style={{
                              backgroundColor: "#fafafb",
                              marginBottom: 10,
                              borderRadius: 6,
                            }}
                          >
                            {doms}
                          </div>
                        );
                      }}
                    >
                      <ProFormGroup grid={true} rowProps={{ gutter: 16 }}>
                        <ProFormText
                          label="关联名称"
                          colProps={{ span: 8 }}
                          name="name"
                          placeholder="请输入关联名称"
                          rules={[
                            { required: true, message: "请输入关联名称" },
                          ]}
                          extra="设置关联名称，且是代码中调用的名称"
                        />
                        <ProFormSelect
                          colProps={{ span: 8 }}
                          name="type"
                          label="关联类型"
                          placeholder="请选择关联类型"
                          rules={[
                            { required: true, message: "请选择关联类型" },
                          ]}
                          request={async () => realtionsType}
                        />
                        <ProFormSelect
                          colProps={{ span: 8 }}
                          name="model"
                          label="关联模型"
                          placeholder="请选择关联模型"
                          rules={[
                            { required: true, message: "请选择关联模型" },
                          ]}
                          request={async () => {
                            const response = await generate.getModels();
                            if (response.success) {
                              return response.data.map((item: string) => ({
                                label: item,
                                value: item,
                              }));
                            }
                            return [];
                          }}
                          showSearch
                          fieldProps={{
                            optionFilterProp: "children",
                            filterOption: (input, option: any) =>
                              (option?.label ?? "")
                                .toLowerCase()
                                .includes(input.toLowerCase()),
                          }}
                        />
                        <ProFormDependency name={["type"]}>
                          {({ type }) =>
                            type === "belongsToMany" ? (
                              <ProFormText
                                label="中间表中本模型外键"
                                colProps={{ span: 8 }}
                                name="foreignKey"
                                rules={[
                                  {
                                    required: true,
                                    message: "中间表中本模型外键",
                                  },
                                ]}
                                extra="此模型在中间表里的外键名"
                              />
                            ) : (
                              <ProFormSelect
                                colProps={{ span: 12 }}
                                name="localKey"
                                label={"本表外键"}
                                placeholder="请选择本表外键"
                                rules={[
                                  { required: true, message: "请选择本表外键" },
                                ]}
                                request={async () =>
                                  dataSource.map((item: DataSourceType) => ({
                                    label:
                                      item.column_name +
                                      " - " +
                                      item.column_comment,
                                    value: item.column_name,
                                  }))
                                }
                                showSearch
                                fieldProps={{
                                  optionFilterProp: "children",
                                  filterOption: (input, option: any) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase()),
                                }}
                                extra="关联键，是指本表的外键"
                              />
                            )
                          }
                        </ProFormDependency>
                        <ProFormDependency name={["type"]}>
                          {({ type }) =>
                            type === "belongsToMany" && (
                              <ProFormSelect
                                colProps={{
                                  span: type === "belongsToMany" ? 8 : 12,
                                }}
                                name="table"
                                label="中间表名称"
                                placeholder="请选择中间表"
                                rules={[
                                  { required: true, message: "请选择中间表" },
                                ]}
                                request={async () => {
                                  const response =
                                    await dataMaintain.getPageList({
                                      pageSize: 9999,
                                    });
                                  if (response.success) {
                                    return response.data.items.map(
                                      (item: TableItem) => ({
                                        label: item.name + " - " + item.comment,
                                        value: item.name,
                                      })
                                    );
                                  }
                                  return [];
                                }}
                                showSearch
                                fieldProps={{
                                  optionFilterProp: "children",
                                  filterOption: (input, option: any) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase()),
                                }}
                                extra="多对多的中间表，一般直接指定表的名称"
                              />
                            )
                          }
                        </ProFormDependency>
                        <ProFormDependency name={["type"]}>
                          {({ type }) =>
                            type === "belongsToMany" ? (
                              <ProFormText
                                label="中间表中关联模型外键"
                                colProps={{ span: 8 }}
                                name="localKey"
                                rules={[
                                  {
                                    required: true,
                                    message: "请输入关联表的外键或中间表的外键",
                                  },
                                ]}
                                extra={
                                  type === "belongsToMany"
                                    ? "关联模型在中间表里的外键名"
                                    : "关联表的主键"
                                }
                              />
                            ) : (
                              <ProFormText
                                label="关联表主键"
                                colProps={{ span: 12 }}
                                name="foreignKey"
                                rules={[
                                  {
                                    required: true,
                                    message: "请输入关联表的外键或中间表的外键",
                                  },
                                ]}
                                extra={
                                  type === "belongsToMany"
                                    ? "关联模型在中间表里的外键名"
                                    : "关联表的主键"
                                }
                              />
                            )
                          }
                        </ProFormDependency>
                      </ProFormGroup>
                    </ProFormList>
                  </>
                ),
              },
            ],
          }}
        />
      </DrawerForm>
    </PageContainer>
  );
};
