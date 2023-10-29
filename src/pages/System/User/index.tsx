/* eslint-disable no-param-reassign */
import type {
    ActionType,
    ProColumns,
    ProFormInstance,
} from "@ant-design/pro-components";
import {
    ModalForm,
    PageContainer,
    ProForm,
    ProFormDependency,
    ProFormRadio,
    ProFormSelect,
    ProFormText,
    ProFormTextArea,
    ProFormTreeSelect,
    ProFormUploadDragger,
    ProTable,
} from "@ant-design/pro-components";
import {
    Alert,
    Avatar,
    Button,
    Dropdown,
    Form,
    message,
    Modal,
    Popconfirm,
    Space,
    Switch,
    Tooltip,
    Upload,
} from "antd";
import type {DataNode} from "antd/es/tree";
import React, {useEffect, useRef, useState} from "react";

import CustomTree from "@/components/CustomTree";
import commonApi from "@/services/api/common";
import dept from "@/services/api/system/dept";
import {dict as dictApi} from "@/services/api/system/dict";
import post from "@/services/api/system/post";
import roleApi from "@/services/api/system/role";
import userApi from "@/services/api/system/user";
import tool from "@/services/tool";
import {
    DatabaseOutlined,
    ExclamationCircleFilled,
    ExportOutlined,
    ImportOutlined,
    InteractionOutlined,
    LoadingOutlined,
    MenuOutlined,
    PlusOutlined,
} from "@ant-design/icons";

const storageMode = {
    "1": "LOCAL",
    "2": "OSS",
    "3": "COS",
    "4": "QINIU",
};

type ColumnItem = {
    id: number; //1,
    username: string; //"admin",
    password: string; //"$2y$10$kmLd7qVpVV/GSiDV7yJBBuFL6s28jPyR1sE4h4LAxVLwLPgRd6heO",
    user_type: string; //"100",
    nickname: string; //"超级管理员",
    phone: string; //"16858888988",
    email: string; //"admin@adminmine.com",
    avatar: string; //null,
    signed: string; //"广阔天地，大有所为",
    dashboard: string; //"statistics",
    dept_id: number; //1,
    status: number; //1,
    login_ip: string; //"172.17.0.1",
    login_time: string; //"2022-11-30 09:25:26",
    backend_setting: any; //null,
    created_by: number; // 0,
    updated_by: number; //1,
    created_at: string; //"2022-11-10 15:59:00",
    updated_at: string; //"2022-11-30 09:25:26",
    remark: string; //null
    postList: { id: number; name: string; }[];
    roleList: { id: number; name: string; }[];
    deptList: { id: number; name: string; }[];
};

export default () => {
    const actionRef = useRef<ActionType>();
    const formRef = useRef<ProFormInstance>();
    const homePageFormRef = useRef<ProFormInstance>();
    const importFormRef = useRef<ProFormInstance>();
    const [row, setRow] = useState<ColumnItem>();
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [homePageFormVisible, setHomePageFormVisible] =
        useState<boolean>(false);
    const [importFormVisible, setImportFormVisible] = useState<boolean>(false);

    const [deptTreeData, setDeptTreeData] = useState<DataNode[]>([]);
    const [deptId, setDeptId] = useState<React.Key | undefined>(undefined);

    const [headImg, setHeadImg] = useState<string | React.ReactNode>();

    useEffect(() => {
        dept.tree().then((res) => {
            setDeptTreeData([
                {
                    id: 0,
                    label: "所有部门",
                },
                ...res.data,
            ]);
        });
        return () => {
            setDeptTreeData([]);
        };
    }, []);

    const columns: ProColumns<ColumnItem>[] = [
        {
            title: "账户",
            dataIndex: "avatar",
            valueType: "avatar",
            width: 150,
            render: (dom, record) => (
                <Space>
                    <span>{dom}</span>
                    {record.username}
                </Space>
            ),
            hideInSearch: true,
        },
        {
            title: "账户",
            dataIndex: "username",
            hideInTable: true,
        },
        {
            title: "昵称",
            dataIndex: "nickname",
            hideInSearch: true,
        },
        {
            title: "手机",
            dataIndex: "phone",
        },
        {
            title: "邮箱",
            dataIndex: "email",
        },
        {
            disable: true,
            title: "状态",
            dataIndex: "status",
            valueType: "select",
            valueEnum: {
                1: {
                    text: "启用",
                    status: "Success",
                },
                0: {
                    text: "禁用",
                    status: "Error",
                },
            },
            initialValue: undefined,
            hideInTable: true,
        },
        {
            title: "状态",
            dataIndex: "status",
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
                            const msg = await userApi.changeStatus({
                                id: record.id,
                                status: checked ? 1 : 2,
                            });
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
            title: "创建时间",
            key: "created_at",
            dataIndex: "created_at",
            valueType: "dateRange",
            sorter: true,
            render: (_: any, record: { created_at: any }) => record.created_at,
        },

        {
            title: "操作",
            valueType: "option",
            key: "option",
            width: 200,
            render: (text: any, record: any) =>
                record.id > 1 && [
                    <Dropdown.Button
                        className="dropdown-buttons"
                        key="permissionGroup"
                        type="primary"
                        menu={{
                            items: [
                                {
                                    key: "refreshcache",
                                    label: "更新缓存",
                                    icon: <MenuOutlined/>,
                                },
                                {
                                    key: "sethomepage",
                                    label: "设置首页",
                                    icon: <DatabaseOutlined/>,
                                },
                                {
                                    key: "resetpassword",
                                    label: "重置密码",
                                    icon: <InteractionOutlined/>,
                                },
                            ],
                            onClick: async ({key}) => {
                                setRow(record);
                                switch (key) {
                                    case "refreshcache":
                                        const msg = await userApi.clearCache({id: record.id});
                                        if (msg.success) {
                                            message.success(msg.message);
                                        } else {
                                            message.error(msg.message);
                                        }
                                        break;
                                    case "sethomepage":
                                        setHomePageFormVisible(true);
                                        break;
                                    case "resetpassword":
                                        Modal.confirm({
                                            title: "系统确认",
                                            icon: <ExclamationCircleFilled/>,
                                            content: "是否确认将用户密码重置为 123456 ？",
                                            onOk() {
                                                userApi
                                                    .initUserPassword({id: record.id})
                                                    .then((res) => {
                                                        if (res.success) {
                                                            message.success(res.message);
                                                        } else {
                                                            message.error(res.message);
                                                        }
                                                    });
                                            },
                                            onCancel() {
                                            },
                                        });
                                        break;
                                }
                            },
                        }}
                        onClick={async () => {
                            const msg = await userApi.read(record.id);
                            if (msg.success) {
                                const curRow = msg.data;
                                delete curRow.password;
                                curRow.role_ids = curRow.roleList.map((item: any) => item.id);
                                curRow.post_ids = curRow.postList.map((item: any) => item.id);
                                curRow.dept_ids = curRow.deptList.map((item: any) => item.id);
                                setRow(curRow);
                                setHeadImg(curRow.avatar);
                                setFormVisible(true);
                            } else {
                                message.error(msg.message);
                            }
                        }}
                        size="small"
                    >
                        编辑
                    </Dropdown.Button>,
                    <Popconfirm
                        key="popconfirm"
                        title="确定要删除吗？"
                        onConfirm={async () => {
                            const result = await userApi.deletes({ids: [record.id]});
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
                            path: "",
                            title: "权限",
                        },
                        {
                            path: "",
                            title: "用户管理",
                        },
                    ],
                },
            }}
        >
            <ProTable<ColumnItem>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                rowSelection={{
                    // selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
                    defaultSelectedRowKeys: [],
                    getCheckboxProps: (record) => ({
                        disabled: record.id === 1,
                        value: record.id,
                    }),
                }}
                tableAlertRender={({selectedRowKeys, onCleanSelected}) => (
                    <span>
            已选 {selectedRowKeys.length} 项
            <Button
                type="link"
                style={{marginInlineStart: 8}}
                onClick={onCleanSelected}
            >
              取消选择
            </Button>
          </span>
                )}
                tableAlertOptionRender={({selectedRowKeys}) => {
                    return (
                        <Space size={16}>
                            <Popconfirm
                                title="确定要批量删除吗？"
                                onConfirm={async () => {
                                    const msg = await userApi.deletes({ids: selectedRowKeys});
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
                params={{dept_id: deptId}}
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
                    params = {page: params.current, ...params};
                    delete params.current;

                    const result = await userApi.getPageList({
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
                        key="create"
                        type="primary"
                        shape="round"
                        icon={<PlusOutlined/>}
                        onClick={() => setFormVisible(true)}
                    >
                        新建
                    </Button>,
                    <Button
                        key="import"
                        shape="round"
                        icon={<ImportOutlined/>}
                        onClick={() => setImportFormVisible(true)}
                    >
                        导入
                    </Button>,
                    <Button
                        key="export"
                        shape="round"
                        icon={<ExportOutlined/>}
                        onClick={() => {
                            commonApi
                                .download("system/user/export")
                                .then((res) => {
                                    message.success("请求成功，文件开始下载");
                                    tool.download(res as any);
                                })
                                .catch(() => {
                                    message.error("请求服务器错误，下载失败");
                                });
                        }}
                    >
                        导出
                    </Button>,
                ]}
                tableRender={(_, dom) => (
                    <div
                        style={{
                            display: "flex",
                            width: "100%",
                            gap: 8,
                        }}
                    >
                        <CustomTree
                            showToolbar={false}
                            originalTreeData={deptTreeData}
                            defaultSelected={[0]}
                            checkable={false}
                            onSelected={(keys) => {
                                setDeptId(keys[0] === 0 ? undefined : keys[0]);
                            }}
                        />
                        <div
                            style={{
                                flex: 1,
                            }}
                        >
                            {dom}
                        </div>
                    </div>
                )}
            />
            <ModalForm
                title={row ? "编辑" : "新增"}
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
                        formRef.current?.resetFields([
                            "username",
                            "password",
                            "nickname",
                            "phone",
                            "email",
                            "status",
                            "remarik",
                        ]);
                    },
                }}
                initialValues={row ?? {status: 1, sort: 1}}
                submitTimeout={2000}
                onFinish={async (values) => {
                    let result = null;
                    if (row) {
                        result = await userApi.update(row.id, values);
                    } else {
                        result = await userApi.save(values);
                    }
                    if (!result.success) {
                        message.error(result.message);
                        return false;
                    }

                    message.success("提交成功");
                    formRef.current?.resetFields([
                        "username",
                        "password",
                        "nickname",
                        "phone",
                        "email",
                        "status",
                        "remarik",
                    ]);
                    setRow(undefined);
                    setFormVisible(false);
                    actionRef?.current?.reload?.();
                    return true;
                }}
                layout="vertical"
                grid={true}
                rowProps={{
                    gutter: [16, 0],
                }}
            >
                <Form.Item
                    name="avatar"
                    valuePropName="image"
                    className="custom-upload"
                >
                    <Upload
                        maxCount={1}
                        customRequest={async ({file, onSuccess, onError}) => {
                            const formData = new FormData();
                            formData.append("image", file);
                            const msg = await commonApi.uploadImage(formData);
                            if (msg.success) {
                                msg.data.url = tool.attachUrl(
                                    msg.data.url,
                                    storageMode[msg.data.storage_mode]
                                );
                                onSuccess?.(msg);
                            } else {
                                message.error(msg.message);
                                onError?.({method: "POST"} as any);
                            }
                        }}
                        listType="picture-card"
                        showUploadList={false}
                        beforeUpload={(file) => {
                            const isJpgOrPng =
                                file.type === "image/jpeg" || file.type === "image/png";
                            if (!isJpgOrPng) {
                                message.error("只能上传 JPG/PNG 文件!");
                            }
                            const isLt2M = file.size / 1024 / 1024 < 2;
                            if (!isLt2M) {
                                message.error("图片需小于2MB!");
                            }
                            return isJpgOrPng && isLt2M;
                        }}
                        onChange={async (info) => {
                            if (info.file.status === "uploading") {
                                setHeadImg(<LoadingOutlined/>);
                                return;
                            }
                            if (info.file.status === "done") {
                                const src = info.file.response.data.url;
                                formRef.current?.setFieldsValue({avatar: src});
                                setHeadImg(src);
                            }
                        }}
                        style={{border: 0}}
                    >
                        {headImg ? (
                            <Avatar size={100} src={headImg} style={{color: "red"}}/>
                        ) : (
                            "+ 上传头像"
                        )}
                    </Upload>
                </Form.Item>
                <ProFormText
                    colProps={{md: 12, xl: 12}}
                    name="username"
                    label={"账户"}
                    tooltip="最长为 24 位"
                    placeholder="请输入账户"
                    disabled={!!row}
                    rules={[
                        {
                            required: true,
                            message: "请输入账户",
                        },
                    ]}
                />
                <ProFormText.Password
                    colProps={{md: 12, xl: 12}}
                    name="password"
                    label="密码"
                    placeholder="请输入密码"
                    disabled={!!row}
                    rules={[
                        {
                            required: !row,
                            message: "请输入密码",
                        },
                    ]}
                />
                <ProFormText
                    colProps={{md: 12, xl: 8}}
                    name="nickname"
                    label="昵称"
                    placeholder="请输入昵称"
                />
                <ProFormText
                    colProps={{md: 12, xl: 8}}
                    name="phone"
                    label="手机"
                    placeholder="请输入手机"
                />
                <ProFormText
                    colProps={{md: 12, xl: 8}}
                    name="email"
                    label="邮箱"
                    placeholder="请输入邮箱"
                    rules={[
                        {type: 'email'}
                    ]}
                />
                <ProFormSelect
                    colProps={{md: 12, xl: 12}}
                    mode="multiple"
                    allowClear={true}
                    name="role_ids"
                    label="角色"
                    placeholder="请选择角色"
                    rules={[
                        {
                            required: true,
                            message: "请选择角色",
                        },
                    ]}
                    request={async () => {
                        const msg = await roleApi.getList();
                        if (msg.success) {
                            return msg.data;
                        }
                    }}
                    fieldProps={{
                        fieldNames: {
                            label: "name",
                            value: "id",
                        },
                    }}
                />
                <ProFormDependency name={["role_ids"]}>
                    {({role_ids}) => (
                        <>
                            <ProFormTreeSelect
                                colProps={{md: 12, xl: 12}}
                                allowClear={true}
                                name="dept_ids"
                                label="部门"
                                placeholder="请选择部门"
                                rules={[
                                    {
                                        required: !role_ids?.includes(4),
                                        message: "请选择部门",
                                    },
                                ]}
                                request={async () => {
                                    const msg = await dept.tree();
                                    if (msg.success) {
                                        return msg.data;
                                    }
                                }}
                                fieldProps={{
                                    multiple: true,
                                    treeDefaultExpandAll: true,
                                }}
                            />
                            <ProFormSelect
                                colProps={{md: 12, xl: 12}}
                                mode="multiple"
                                name="post_ids"
                                label="岗位"
                                placeholder="请选择岗位"
                                rules={[
                                    {
                                        required: !role_ids?.includes(4),
                                        message: "请选择岗位",
                                    },
                                ]}
                                request={async () => {
                                    const msg = await post.getList();
                                    if (msg.success) {
                                        return msg.data;
                                    }
                                }}
                                fieldProps={{
                                    fieldNames: {
                                        label: "name",
                                        value: "id",
                                    },
                                }}
                            />
                        </>
                    )}
                </ProFormDependency>
                <ProFormRadio.Group
                    colProps={{md: 12, xl: 12}}
                    name="status"
                    label="状态"
                    options={[
                        {
                            label: "启用",
                            value: 1,
                        },
                        {
                            label: "禁用",
                            value: 2,
                        },
                    ]}
                />
                <ProFormTextArea name="remark" label="备注"/>
            </ModalForm>
            <ModalForm
                title="首页设置"
                open={homePageFormVisible}
                onOpenChange={(open) => setHomePageFormVisible(open)}
                width={350}
                formRef={homePageFormRef}
                autoFocusFirstInput
                modalProps={{
                    maskClosable: false,
                    destroyOnClose: true,
                    onCancel: () => {
                        setRow(undefined);
                        homePageFormRef.current?.resetFields(["username"]);
                    },
                }}
                initialValues={row ?? {dashboard: ""}}
                submitTimeout={2000}
                onFinish={async (values) => {
                    if (!row) return;
                    const result = await userApi.setHomePage({id: row.id, ...values});
                    if (!result.success) {
                        message.error(result.message);
                        return false;
                    }

                    message.success("提交成功");
                    homePageFormRef.current?.resetFields(["username"]);
                    setRow(undefined);
                    setHomePageFormVisible(false);
                    actionRef?.current?.reload?.();
                    return true;
                }}
                layout="vertical"
            >
                <ProFormText
                    name="username"
                    label="账户"
                    disabled={true}
                    rules={[{required: true, message: "请输入账户"}]}
                />
                <ProFormSelect
                    allowClear={true}
                    name="dashboard"
                    label="用户首页"
                    placeholder="请选择首页"
                    rules={[{required: true, message: "请选择首页"}]}
                    request={async () => {
                        const msg = await dictApi.getDict("dashboard");
                        if (msg.success) {
                            return msg.data;
                        }
                    }}
                    fieldProps={{
                        fieldNames: {
                            label: "title",
                            value: "key",
                        },
                    }}
                    extra="用户登录后台后，进入的第一个页面"
                />
            </ModalForm>
            <Modal
                title="导入用户"
                open={importFormVisible}
                width={350}
                destroyOnClose={true}
                onOk={async (values: any) => {
                    if (!row) return;
                    const result = await userApi.setHomePage({id: row.id, ...values});
                    if (!result.success) {
                        message.error(result.message);
                        return false;
                    }

                    message.success("提交成功");
                    importFormRef.current?.resetFields();
                    setRow(undefined);
                    setHomePageFormVisible(false);
                    actionRef?.current?.reload?.();
                    return true;
                }}
                onCancel={() => setImportFormVisible(false)}
                footer={false}
            >
                <Alert
                    message={
                        <span>
              请先下载导入模板，
              <Button
                  type="link"
                  onClick={async () => {
                      commonApi
                          .download("system/user/downloadTemplate")
                          .then((res) => {
                              message.success("请求成功，文件开始下载");
                              tool.download(res as any);
                          })
                          .catch(() => {
                              message.error("请求服务器错误，下载失败");
                          });
                  }}
              >
                点击下载
              </Button>
            </span>
                    }
                    type="info"
                    showIcon
                    style={{marginBottom: 15}}
                />
                <ProForm submitter={false}>
                    <ProFormUploadDragger
                        max={1}
                        label=""
                        name="import"
                        title="单击或拖动Excel文件到此区域进行上传"
                        description="只支持xls/xlsx格式"
                        accept=".xls,.xlsx"
                        fieldProps={{
                            customRequest: async ({file, onSuccess, onError}) => {
                                const formData = new FormData();
                                formData.append("file", file);

                                commonApi
                                    .importExcel("system/user/import", formData)
                                    .then((res) => {
                                        if (res.success) {
                                            message.success(res.message || "导入成功");
                                            onSuccess?.(res);
                                        } else {
                                            message.error(res.message || "导入失败");
                                            onError?.({method: "POST"} as any);
                                        }
                                    })
                                    .catch((error) => {
                                        console.error(error.response.data.message);
                                        message.destroy();
                                        message.error("导入失败");
                                        onError?.({method: "POST"} as any);
                                    });
                            },
                            beforeUpload: (file) => {
                                const isValid =
                                    file.type.indexOf("vnd.ms-excel") < 0 ||
                                    file.type.indexOf("vnd.openxmlformats") < 0;
                                if (!isValid) {
                                    message.error("只能上传 xls/xlsx 文件!");
                                }
                                const isLt2M = file.size / 1024 / 1024 < 2;
                                if (!isLt2M) {
                                    message.error("文件需小于2MB!");
                                }
                                return (isValid && isLt2M) || Upload.LIST_IGNORE;
                            },
                            onChange: async (info) => {
                                if (info.file.status === "uploading") {
                                    return;
                                }
                                if (info.file.status === "done") {
                                    setImportFormVisible(false);
                                    actionRef.current?.reload?.();
                                }
                            },
                        }}
                    />
                </ProForm>
            </Modal>
        </PageContainer>
    );
};
