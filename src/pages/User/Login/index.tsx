import Footer from '@/components/Footer';
import SelectLang from '@/components/SelectLang';
import { ProForm, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { FormattedMessage, useIntl, useModel } from '@umijs/max';
import { Alert, Button, Card, Col, ConfigProvider, message as Message, Row } from 'antd';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import styles from './index.less';
// import images
import bgimg from '../../../../public/images/login-bg.png';
import profile from '../../../../public/images/profile-img.png';
import logo from '../../../../public/logo.svg';

import login from '@/services/api/login';
import tool from '@/services/tool';

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [message, contextHolder] = Message.useMessage();
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const [loading, setLoading] = useState<boolean>(false);

  const intl = useIntl();

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          CurrentInfo: userInfo,
        }));
      });
    }
    return userInfo;
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      setLoading(true);
      // 登录
      const msg = (await login.login({ ...values })) as any;
      setLoading(false);
      if (msg.success) {
        const defaultLoginSuccessMessage = intl.formatMessage({
          id: 'pages.login.success',
          defaultMessage: '登录成功！',
        });
        message.success(defaultLoginSuccessMessage);
        tool.setToken(msg.data.token);
        const info = await fetchUserInfo();
        const urlParams = new URL(window.location.href).searchParams;
        //history.push(urlParams.get('redirect') || '/');
        // 重新加载，才会更新服务端路由
        window.location.href = urlParams.get('redirect') || (info?.user.dashboard ?? '/');
        return;
      }
      // 如果失败去设置用户错误信息
      setUserLoginState(msg);
    } catch ({ name, info }) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };
  const { success, message: msg } = userLoginState;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#36cfc9',
        },
      }}
    >
      {contextHolder}
      <div
        className={styles.container}
        style={{ backgroundImage: `url(${bgimg})`, backgroundSize: '100%' }}
      >
        <div className={styles.lang} data-lang>
          {SelectLang && <SelectLang />}
        </div>
        <div className={styles.content}>
          <Card
            style={{ maxWidth: 450 }}
            bodyStyle={{ padding: 0, borderRadius: 6, overflow: 'hidden' }}
          >
            <Row style={{ backgroundColor: 'rgba(85, 110, 230, 0.25)', padding: 0 }}>
              <Col span={12}>
                <div style={{ padding: 24 }}>
                  <img src={logo} style={{ height: 90 }} />
                </div>
              </Col>
              <Col span={12}>
                <img
                  src={profile}
                  alt=""
                  style={{ maxWidth: '100%', height: 'auto', verticalAlign: 'bottom' }}
                />
              </Col>
            </Row>
            <ProForm
              initialValues={{
                autoLogin: true,
              }}
              onFinish={async (values) => {
                await handleSubmit(values as API.LoginParams);
              }}
              submitter={false}
              style={{ padding: 24 }}
            >
              {success === false && (
                <LoginMessage
                  content={
                    msg ??
                    intl.formatMessage({
                      id: 'pages.login.accountLogin.errorMessage',
                      defaultMessage: '账户或密码错误',
                    })
                  }
                />
              )}
              <ProFormText
                label="Login username"
                name="username"
                fieldProps={{
                  size: 'large',
                  required: false,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                label="Login password"
                name="password"
                fieldProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <ProFormCheckbox noStyle name="autoLogin">
                  <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
                </ProFormCheckbox>
                <a
                  style={{
                    float: 'right',
                  }}
                >
                  <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
                </a>
              </div>
              <Button type="primary" block htmlType="submit" size="large" loading={loading}>
                {intl.formatMessage({id:'pages.login.submit'})}
              </Button>
            </ProForm>
          </Card>
        </div>
        <Footer />
      </div>
    </ConfigProvider>
  );
};

export default Login;
