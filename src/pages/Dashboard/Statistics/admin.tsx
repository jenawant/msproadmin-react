/* eslint-disable no-param-reassign */
import {ProCard, StatisticCard} from '@ant-design/pro-components';
import {Link} from '@umijs/max';

import React, {useEffect, useState} from 'react';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

import {EuroCircleFilled, PieChartFilled, ProfileFilled} from '@ant-design/icons';
import {Alert, Space} from 'antd';

const imgStyle = {
  display: 'block',
  width: 42,
  height: 42,
  fontSize: 42,
};

const refreshFrequency = 5; //minute
let processTimer: any = null;

export default () => {
  const [refresh, setRefresh] = useState<number>();
  // 定时刷新
  useEffect(() => {
    processTimer = window.setInterval(() => {
      setRefresh(Math.random());
    }, 1000 * refreshFrequency);
    return () => {
      window.clearInterval(processTimer);
    };
  }, []);

  useEffect(() => {
    const fetch = async () => {
      //TODO 需定时刷新逻辑
    };
    fetch();
  }, [refresh]);

  return (
    <ProCard ghost gutter={16} wrap>
      <StatisticCard.Group title="Statistics" style={{marginBlockEnd: 24}}>
        <StatisticCard
          statistic={{
            title: 'Users',
            value: 0,
            icon: <ProfileFilled style={{...imgStyle, color: '#FA8C16'}}/>,
          }}
          extra={<Link to={'/user/info'}>list</Link>}
        />
        <StatisticCard.Divider/>
        <StatisticCard
          statistic={{
            title: 'Transactions',
            value: 0,
            icon: <EuroCircleFilled style={{...imgStyle, color: '#1890FF'}}/>,
            description: (
              <Space size={8} direction="vertical" style={{width: '100%'}}>
                {1 > 0 && (
                  <Alert
                    type="info"
                    showIcon
                    message={`0 Proccessing Transactions (stat: Processing)`}
                    action={<Link to={'/transactions/orders'}>Process</Link>}
                    style={{padding: '4px 6px'}}
                  />
                )}
              </Space>
            ),
          }}
          extra={<Link to={'/transaction/orders'}>list</Link>}
        />
        <StatisticCard.Divider/>
        <StatisticCard
          statistic={{
            title: 'Verifications',
            value: 0,
            icon: <PieChartFilled style={{...imgStyle, color: '#5BD171'}}/>,
            description: 1 > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`0 verifications under review`}
                action={<Link to={'/user/verification'}>Process</Link>}
                style={{padding: '4px 6px'}}
              />
            ),
          }}
          extra={<Link to={'/user/verification'}>list</Link>}
        />
      </StatisticCard.Group>
    </ProCard>
  );
};
