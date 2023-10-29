/* eslint-disable no-param-reassign */
import AddButton from "@/components/CRUD/AddButton";
import DeleteBatchButton from "@/components/CRUD/DeleteBatchButton";
import DeleteButton from "@/components/CRUD/DeleteButton";
import EditButton from "@/components/CRUD/EditButton";
import ExportButton from "@/components/CRUD/ExportButton";
import ImportButton from "@/components/CRUD/ImportButton";
import type {
  ActionType,
  ProColumns,
  ProFormColumnsType,
  ProFormInstance,
} from "@ant-design/pro-components";
import {
  BetaSchemaForm,
  ModalForm,
  PageContainer,
  ProTable,
} from "@ant-design/pro-components";
import { useIntl } from "@umijs/max";
import { Button, message as Message } from "antd";
import React, { useRef, useState } from "react";

import settingDatasource from "@/services/api/setting/settingDatasource";

type ColumnItem = {
  source_name: string;
  dsn: string;
  username: string;
  password: string;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  remark: string;
};

const CRUD = {
  rowSelection: {
    showCheckedAll: true,
  },
  searchLabelWidth: "auto",
  pk: "source_name",
  operationWidth: 160,
  formSetting: {
    cols: 1,
    width: 600,
  },
  api: settingDatasource.getList,
  recycleApi: settingDatasource.getRecycleList,
  add: {
    show: true,
    api: settingDatasource.save,
    auth: "setting:datasource:save",
  },
  edit: {
    show: true,
    api: settingDatasource.update,
    auth: "setting:datasource:update",
  },
  delete: {
    show: true,
    api: settingDatasource.deletes,
    auth: "setting:datasource:delete",
    realApi: settingDatasource.realDeletes,
    realAuth: "setting:datasource:realDeletes",
  },
  recovery: {
    show: true,
    api: settingDatasource.recoverys,
    auth: "setting:datasource:recovery",
  },
  import: {
    show: true,
    url: "setting/datasource/import",
    templateUrl: "setting/datasource/downloadTemplate",
    auth: "setting:datasource:import",
  },
  export: {
    show: true,
    url: "setting/datasource/export",
    auth: "setting:datasource:export",
  },
};

export default () => {
  const intl = useIntl();
  const [message, contextHolder] = Message.useMessage();
  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();
  const [row, setRow] = useState<ColumnItem>();
  const [formVisible, setFormVisible] = useState(false);

  const columns: (ProColumns<ColumnItem, "dict" | "country" | "upload"> &
    ProFormColumnsType<ColumnItem, "dict" | "country" | "upload">)[] = [
    {
      title: "数据源名称",
      dataIndex: "source_name",
      valueType: "text",
      formItemProps: {
        rules: [
          {
            required: true,
            message: "数据源名称 字段是必须的",
          },
        ],
      },
    },
    {
      title: "DSN连接串",
      dataIndex: "dsn",
      valueType: "textarea",
      tooltip: "例如，mysql:host=myhost;dbname=mydb;port=3306",
      initialValue:
        "mysql:host=数据库地址;dbname=数据库名称;port=3306;charset=utf8mb4",
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "DSN连接串 字段是必须的",
          },
        ],
      },
    },
    {
      title: "数据库用户",
      dataIndex: "username",
      valueType: "text",
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: "数据库用户 字段是必须的",
          },
        ],
      },
    },
    {
      title: "数据库密码",
      dataIndex: "password",
      valueType: "password",
      hideInSearch: true,
    },
    {
      title: "创建者",
      dataIndex: "created_by",
      valueType: "text",
      hideInSearch: true,
      hideInForm: true,
      hideInTable: true,
    },
    {
      title: "更新者",
      dataIndex: "updated_by",
      valueType: "text",
      hideInSearch: true,
      hideInForm: true,
      hideInTable: true,
    },
    {
      title: "创建时间",
      dataIndex: "created_at",
      valueType: "dateRange",
      hideInSearch: true,
      hideInForm: true,
      hideInTable: false,
      render: (_, record) => record.created_at,
    },
    {
      title: "更新时间",
      dataIndex: "updated_at",
      valueType: "dateTime",
      hideInSearch: true,
      hideInForm: true,
      hideInTable: true,
      fieldProps: {
        mode: "date",
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      valueType: "textarea",
      hideInSearch: true,
      hideInForm: false,
      hideInTable: true,
    },
  ];
  columns.push({
    title: intl.formatMessage({ id: "component.table.option.title" }),
    width: CRUD.operationWidth,
    valueType: "option",
    key: "option",
    render: (text: any, record: any) => [
      <Button
        key={"test_link"}
        type={"primary"}
        size={"small"}
        shape={"round"}
        onClick={async () => {
          message.loading("正在测试连接，请稍后");
          const response = await settingDatasource.testLink({ id: record.id });
          if (response.success) message.success("连接成功");
          if (!response.success) message.error("连接失败");
        }}
      >
        测试连接
      </Button>,
      CRUD.edit.show && (
        <EditButton
          key="edit"
          CRUD={CRUD}
          onClick={() => {
            setRow(record);
            setFormVisible(true);
          }}
        />
      ),
      CRUD.delete.show && (
        <DeleteButton
          key="delete"
          CRUD={CRUD}
          id={record?.[CRUD.pk]}
          actionRef={actionRef}
        />
      ),
    ],
    hideInForm: true,
    hideInSearch: true,
  });

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
              title: "数据源管理",
            },
          ],
        },
      }}
    >
      {contextHolder}
      <ProTable
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowSelection={
          CRUD.rowSelection.showCheckedAll
            ? {
                defaultSelectedRowKeys: [],
              }
            : undefined
        }
        tableAlertRender={({ selectedRowKeys, onCleanSelected }) => (
          <span>
            {intl.formatMessage(
              { id: "component.table.cancel_select.selected" },
              { size: selectedRowKeys.length }
            )}
            <Button
              type="link"
              style={{ marginInlineStart: 8 }}
              onClick={onCleanSelected}
            >
              {intl.formatMessage({ id: "component.table.cancel_select" })}
            </Button>
          </span>
        )}
        tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => {
          return (
            CRUD.rowSelection.showCheckedAll && (
              <DeleteBatchButton
                CRUD={CRUD}
                ids={selectedRowKeys}
                onFinish={() => {
                  actionRef.current?.reload();
                  onCleanSelected();
                }}
              />
            )
          );
        }}
        request={async (params: any = {}, sort: any = {}) => {
          // SORT
          let sorts = undefined;
          if (Object.keys(sort).length > 0) {
            sorts = {
              orderBy: Object.keys(sort)[0],
              orderType: Object.values(sort)[0] == "ascend" ? "asc" : "desc",
            };
          }
          // PAGE
          params = { page: params.current, ...params };
          delete params.current;

          const result = await CRUD.api({
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
        rowKey={CRUD.pk}
        search={{
          labelWidth: CRUD.searchLabelWidth as any,
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
          CRUD?.add?.show && (
            <AddButton
              key="add"
              CRUD={CRUD}
              onClick={() => setFormVisible(true)}
            />
          ),
          CRUD?.import?.show && (
            <ImportButton key="import" CRUD={CRUD} actionRef={actionRef} />
          ),
          CRUD?.export?.show && <ExportButton key="export" CRUD={CRUD} />,
        ]}
      />
      <ModalForm
        title={intl.formatMessage({
          id: row ? "component.form.title.edit" : "component.form.title.add",
        })}
        width={CRUD.formSetting.width}
        open={formVisible}
        onOpenChange={(open) => setFormVisible(open)}
        submitTimeout={2000}
        formRef={formRef}
        request={async () => row ?? {}}
        autoFocusFirstInput
        onFinish={async (values) => {
          const result = row
            ? await CRUD.edit.api(row?.[CRUD.pk], values)
            : await CRUD.add.api(values);
          if (!result.success) {
            message.error(result.message);
            return false;
          }

          message.success(result.message);
          formRef.current?.resetFields();
          setRow(undefined);
          setFormVisible(false);
          actionRef?.current?.reload?.();
          return true;
        }}
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
          onCancel: () => {
            setRow(undefined);
            formRef.current?.resetFields();
          },
        }}
      >
        <BetaSchemaForm<ColumnItem, "dict" | "country" | "upload">
          layoutType="Embed"
          columns={columns}
        />
      </ModalForm>
    </PageContainer>
  );
};
