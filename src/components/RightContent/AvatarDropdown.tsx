import {
  ClearOutlined,
  DownOutlined,
  LoadingOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ProFormInstance } from "@ant-design/pro-components";
import {
  DrawerForm,
  ProForm,
  ProFormText,
  ProFormTextArea,
} from "@ant-design/pro-components";
import { history, useIntl, useModel } from "@umijs/max";
import type { MenuProps } from "antd";
import {
  App,
  Avatar,
  Dropdown,
  Form,
  Modal,
  Spin,
  Statistic,
  Tabs,
  Upload,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import default_avatar from "../../../public/images/users/avatar-1.jpg";
import styles from "./index.less";

import { default as commonApi } from "@/services/api/common";
import { default as login, default as loginApi } from "@/services/api/login";
import userApi from "@/services/api/system/user";
import tool from "@/services/tool";
import dayjs from "dayjs";

const storageMode = {
  "1": "LOCAL",
  "2": "OSS",
  "3": "COS",
  "4": "QINIU",
};

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

const AvatarDropdown: React.FC<GlobalHeaderRightProps> = () => {
  const intl = useIntl();
  const { message } = App.useApp();

  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    const result = (await loginApi.logout()) as any;
    if (result.success) {
      tool.clearToken();
      // const { search, pathname } = window.location;
      // const urlParams = new URL(window.location.href).searchParams;
      // /** 此方法会跳转到 redirect 参数所在的位置 */
      // const redirect = urlParams.get('redirect');
      // // Note: There may be security issues, please note
      // if (window.location.pathname !== '/login' && !redirect) {
      //   history.replace({
      //     pathname: '/login',
      //     search: stringify({
      //       redirect: pathname + search,
      //     }),
      //   });
      // }
      history.push("/login");
    }
  };

  // 定时检测token
  useEffect(() => {
    const tokenTimer = window.setTimeout(() => {
      Modal.confirm({
        title: "Confirmation",
        content: (
          <div>
            The session will expire after
            <Statistic.Countdown
              value={dayjs(tool.getTokenExpiredAt()).valueOf()}
              onFinish={() => {
                loginOut();
                Modal.destroyAll();
              }}
              style={{ display: "inline", marginInlineStart: 6 }}
              valueStyle={{ display: "inline", fontSize: 16 }}
            />
            . Do you want to retrieve it again?
          </div>
        ),
        onOk: async () => {
          await login.refresh().then((res) => {
            tool.setToken(res.data.token);
          });
        },
      });
    }, 1000 * (dayjs(tool.getTokenExpiredAt()).diff(dayjs(), "second") - 100));
    return () => {
      window.clearInterval(tokenTimer);
    };
  }, []);

  const { initialState, setInitialState } = useModel("@@initialState");

  const formRef = useRef<ProFormInstance>();
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [headImg, setHeadImg] = useState<string | React.ReactNode>();
  const [activeKey, setActiveKey] = useState<string>("1");

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      flushSync(() => {
        setInitialState((s) => ({ ...s, CurrentInfo: undefined }));
      });
      loginOut();
      return;
    }
    if (key === "cleancache") {
      commonApi.clearAllCache().then((res) => {
        if (res.success) {
          message.success(res.message);
        } else {
          message.error(res.message);
        }
      });
      return;
    }
    if (key === "center") {
      setDrawerVisible(true);
      setTimeout(() => {
        formRef?.current?.setFieldsValue({
          ...initialState?.CurrentInfo?.user,
        });
      }, 0);

      setHeadImg(initialState?.CurrentInfo?.user.avatar);
    }
  };

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { CurrentInfo } = initialState;

  if (!CurrentInfo || !CurrentInfo.user.username) {
    return loading;
  }

  const menuItems: MenuProps["items"] = [
    {
      key: "center",
      icon: <UserOutlined />,
      label: intl.formatMessage({ id: "pages.topmenu.usercenter" }),
    },
    {
      type: "divider" as const,
    },
    {
      key: "cleancache",
      icon: <ClearOutlined />,
      label: intl.formatMessage({ id: "pages.topmenu.clearcache" }),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: "pages.topmenu.logout" }),
    },
  ];

  return (
    <div>
      <Dropdown
        menu={{ items: menuItems, onClick: onMenuClick }}
        placement="bottomLeft"
      >
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar
            size={30}
            className={styles.avatar}
            src={CurrentInfo.user?.info?.avatar ?? default_avatar}
            alt="avatar"
          />
          <span className={`${styles.name} anticon`}>
            {CurrentInfo.user?.username}{" "}
            <DownOutlined
              style={{ fontSize: 10, color: "#ccc", marginLeft: 5 }}
            />
          </span>
        </span>
      </Dropdown>
      <DrawerForm
        formRef={formRef}
        width={400}
        onOpenChange={setDrawerVisible}
        title={intl.formatMessage({ id: "pages.topmenu.usersetting" })}
        open={drawerVisible}
        drawerProps={{
          maskClosable: false,
          closable: false,
          forceRender: true,
        }}
        submitter={{
          resetButtonProps: {
            onClick: () => {
              setDrawerVisible(false);
              setHeadImg(undefined);
              formRef.current?.resetFields();
            },
          },
        }}
        onFinish={async (value) => {
          let msg;
          if (activeKey === "1") {
            msg = await userApi.updateInfo({
              id: CurrentInfo.user.id,
              ...value,
            });
          } else {
            msg = await userApi.modifyPassword(value);
          }

          if (msg.success) {
            if (activeKey === "2") {
              message.info(
                intl.formatMessage({ id: "pages.topmenu.relogin" }),
                2,
                () => {
                  onMenuClick({ key: "logout" } as any);
                }
              );
            } else {
              formRef?.current?.resetFields();
              setHeadImg(undefined);

              //即时更新用户资料
              const newInfo = await initialState.fetchUserInfo?.();
              flushSync(() =>
                setInitialState((s) => ({ ...s, CurrentInfo: newInfo }))
              );
            }

            return true;
          }
          return false;
        }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={setActiveKey}
          items={[
            {
              label: (
                <span>
                  <UserOutlined />
                  {intl.formatMessage({ id: "pages.topmenu.basicinfo" })}
                </span>
              ),
              key: "1",
              children: (
                <>
                  <Form.Item
                    name="avatar"
                    valuePropName="image"
                    className="custom-upload"
                  >
                    <Upload
                      maxCount={1}
                      customRequest={async ({ file, onSuccess, onError }) => {
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
                          onError?.({ method: "POST" } as any);
                        }
                      }}
                      listType="picture-card"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isJpgOrPng =
                          file.type === "image/jpeg" ||
                          file.type === "image/png";
                        if (!isJpgOrPng) {
                          message.error("Only JPG/PNG!");
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error("Size less then 2MB!");
                        }
                        return isJpgOrPng && isLt2M;
                      }}
                      onChange={async (info) => {
                        if (info.file.status === "uploading") {
                          setHeadImg(<LoadingOutlined />);
                          return;
                        }
                        if (info.file.status === "done") {
                          const src = info.file.response.data.url;
                          formRef.current?.setFieldsValue({ avatar: src });
                          setHeadImg(src);
                        }
                      }}
                      style={{ border: 0 }}
                    >
                      {headImg ? (
                        <Avatar
                          size={100}
                          src={headImg}
                          style={{ color: "red" }}
                        />
                      ) : (
                        intl.formatMessage({
                          id: "pages.topmenu.basicinfo.uploadavatar",
                        })
                      )}
                    </Upload>
                  </Form.Item>
                  <ProForm.Group>
                    <ProFormText
                      readonly={true}
                      width="md"
                      name="username"
                      label={intl.formatMessage({
                        id: "pages.topmenu.basicinfo.username",
                      })}
                    />
                    <ProFormTextArea
                      width="md"
                      name="signed"
                      label={intl.formatMessage({
                        id: "pages.topmenu.basicinfo.sign",
                      })}
                      fieldProps={{
                        showCount: true,
                        maxLength: 100,
                      }}
                    />
                  </ProForm.Group>
                </>
              ),
            },
            {
              label: (
                <span>
                  <SettingOutlined />
                  {intl.formatMessage({ id: "pages.topmenu.secrity" })}
                </span>
              ),
              key: "2",
              children: (
                <>
                  <ProForm.Group>
                    <ProFormText.Password
                      rules={[
                        {
                          required: activeKey === "2",
                        },
                      ]}
                      width="md"
                      name="oldPassword"
                      label={intl.formatMessage({
                        id: "pages.topmenu.secrity.oldpassword",
                      })}
                    />
                    <ProFormText.Password
                      rules={[
                        {
                          required: activeKey === "2",
                        },
                      ]}
                      width="md"
                      name="newPassword"
                      label={intl.formatMessage({
                        id: "pages.topmenu.secrity.newpassword",
                      })}
                    />
                    <ProFormText.Password
                      dependencies={["newPassword"]}
                      rules={[
                        {
                          required: activeKey === "2",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                intl.formatMessage({
                                  id: "pages.topmenu.secrity.password_not_same",
                                })
                              )
                            );
                          },
                        }),
                      ]}
                      width="md"
                      name="newPassword_confirmation"
                      label={intl.formatMessage({
                        id: "pages.topmenu.secrity.newpassword_confirm",
                      })}
                    />
                  </ProForm.Group>
                </>
              ),
            },
          ]}
        />
      </DrawerForm>
    </div>
  );
};

export default AvatarDropdown;
