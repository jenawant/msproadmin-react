/* eslint-disable no-param-reassign */
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import { Link } from '@umijs/max';

import React, { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import common from '@/services/api/common';
import { EuroCircleFilled, PieChartFilled, ProfileFilled } from '@ant-design/icons';
import { Alert, Space } from 'antd';

interface ISummary {
  users: number;
  users_individual: number;
  users_corporate: number;
  transactions: number;
  transactions_processing: number;
  transactions_pending_payout: number;
  verifications: number;
  verifications_under_review: number;
  accounts: number;
}
const defaultSummary: ISummary = {
  users: 0,
  users_individual: 0,
  users_corporate: 0,
  transactions: 0,
  transactions_processing: 0,
  transactions_pending_payout: 0,
  verifications: 0,
  verifications_under_review: 0,
  accounts: 0,
};

const imgStyle = {
  display: 'block',
  width: 42,
  height: 42,
  fontSize: 42,
};

const refreshFrequency = 5; //minute
let processTimer: any = null;

export default () => {
  const [summary, setSummany] = useState<ISummary>(defaultSummary);
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
      await common.getSummary().then((res) => {
        setSummany(res.data);
      });
    };
    fetch();
  }, [refresh]);

  return (
    <ProCard ghost gutter={16} wrap>
      <StatisticCard.Group title="Statistics" style={{ marginBlockEnd: 24 }}>
        <StatisticCard
          statistic={{
            title: 'Users',
            value: summary.users,
            icon: <ProfileFilled style={{ ...imgStyle, color: '#FA8C16' }} />,
            description: <Space size={50}><span>Individual: {summary.users_individual}</span><span>Corporate: {summary.users_corporate}</span></Space>
          }}
          extra={<Link to={'/user/info'}>list</Link>}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: 'Transactions',
            value: summary.transactions,
            icon: <EuroCircleFilled style={{ ...imgStyle, color: '#1890FF' }} />,
            description: (
              <Space size={8} direction="vertical" style={{ width: '100%' }}>
                {summary.transactions_processing > 0 && (
                  <Alert
                    type="info"
                    showIcon
                    message={`${summary.transactions_processing} Proccessing Transactions (stat: Processing)`}
                    action={<Link to={'/user/verification'}>Process</Link>}
                    style={{ padding: '4px 6px' }}
                  />
                )}
                {summary.transactions_pending_payout > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    message={`${summary.transactions_pending_payout} Pending Payouts (stat: Funds received)`}
                    action={<Link to={'/user/verification'}>Process</Link>}
                    style={{ padding: '4px 6px' }}
                  />
                )}
              </Space>
            ),
          }}
          extra={<Link to={'/transaction/orders'}>list</Link>}
        />
        <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: 'Verifications',
            value: summary.verifications,
            icon: <PieChartFilled style={{ ...imgStyle, color: '#5BD171' }} />,
            description: summary.verifications_under_review > 0 && (
              <Alert
                type="warning"
                showIcon
                message={`${summary.verifications_under_review} verifications under review`}
                action={<Link to={'/user/verification'}>Process</Link>}
                style={{ padding: '4px 6px' }}
              />
            ),
          }}
          extra={<Link to={'/user/verification'}>list</Link>}
        />
        {/* <StatisticCard.Divider />
        <StatisticCard
          statistic={{
            title: 'Accounts',
            value: summary.accounts,
            icon: <ReconciliationFilled style={{ ...imgStyle, color: '#5BD171' }} />,
          }}
          extra={<Link to={'/user/account'}>list</Link>}
        /> */}
      </StatisticCard.Group>
    </ProCard>
  );
};
