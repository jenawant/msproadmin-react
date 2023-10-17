import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Card } from 'antd';
import React from 'react';

export default (props: { CurrentInfo?: API.CurrentInfo }) => {
  const intl = useIntl();
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            'radial-gradient(circle at 97% 10%, #EBF2FF 0%, #F5F8FF 28%, #EBF1FF 124%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: '#1A1A1A',
            }}
          >
            {intl.formatMessage(
              { id: 'pages.welcome.back' },
              { username: props?.CurrentInfo?.user.username },
            )}
          </div>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(0,0,0,0.65)',
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '65%',
            }}
          >
            {intl.formatMessage(
              { id: 'pages.welcome.alertMessage' },
              {
                created_at: props?.CurrentInfo?.user.created_at,
                login_ip: props?.CurrentInfo?.user.login_ip,
                login_time: props?.CurrentInfo?.user.login_time,
              },
            )}
          </p>
        </div>
      </Card>
    </PageContainer>
  );
};
