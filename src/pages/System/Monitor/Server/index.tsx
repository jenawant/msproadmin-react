import {PageContainer, ProCard, ProDescriptions} from '@ant-design/pro-components';
import {Button, Divider, Space, Progress} from 'antd';
import React, {useEffect, useState} from 'react';

import monitorApi from '@/services/api/system/monitor';
import {ReloadOutlined} from '@ant-design/icons';

type ServerItem = {
  cpu: {
    name: string; //"Intel(R) Core(TM) i5-1035G1 CPU @ 1.00GHz",
    cores: string; //"物理核心数：1个，逻辑核心数：8个",
    cache: number; //6,
    usage: string; //"0.62",
    free: 99.38;
  };
  memory: {
    total: string; //"7.63",
    free: string; //"6.45",
    usage: string; //"1.18",
    php: number; //13.77,
    rate: string; //"15.47"
  };
  phpenv: {
    swoole_version: string; //"4.8.8",
    php_version: string; //"8.0.16",
    os: string; //"Linux",
    project_path: string; //"/opt/www",
    start_time: string; //"2022-11-28 09:02:12",
    run_time: string; //"0年3天 4小时3分56秒",
    msproadmin_version: string; //"1.0.0",
    hyperf_version: string; //"2.2.33"
  };
  disk: {
    total: string; //"251.0G",
    usage: string; //"2.1G",
    free: string; //"236.1G",
    rate: string; //"1%"
  };
};

export default () => {
  const [data, setData] = useState<ServerItem | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [relaod, setReload] = useState<number>();

  useEffect(() => {
    monitorApi.getServerInfo().then((res) => {
      setData(res.data);
      setLoading(false);
    });
    return () => {
      setData(undefined);
      setLoading(false);
    };
  }, [relaod]);

  const colors = {'0%': '#87d068', '50%': '#ffe58f', '100%': '#fa541c'};
  return (
    <PageContainer
      header={{
        breadcrumb: {
          items: [
            {
              path: '',
              title: '监控',
            },
            {
              path: '',
              title: '服务监控',
            },
          ],
        },
      }}
    >
      <ProCard
        direction="column"
        ghost
        gutter={[0, 16]}
        extra={
          <Button
            type="primary"
            shape="round"
            icon={<ReloadOutlined/>}
            onClick={() => {
              setLoading(true);
              setReload(Math.random());
            }}
            disabled={loading}
          >
            刷新
          </Button>
        }
      >
        <ProCard gutter={[16, 0]} loading={loading}>
          <ProCard colSpan={18} bodyStyle={{padding: 0}}>
            <ProDescriptions
              className="custom-description-label-width-fixed-300"
              size="small"
              column={2}
              title="CPU信息"
              tooltip="包含型号、使用率等信息"
              bordered
            >
              <ProDescriptions.Item label="型号">{data?.cpu.name}</ProDescriptions.Item>
              <ProDescriptions.Item label="核心数">{data?.cpu.cores}</ProDescriptions.Item>
              <ProDescriptions.Item label="缓存">{data?.cpu.cache}</ProDescriptions.Item>
              <ProDescriptions.Item label="使用率" valueType="percent">
                {data?.cpu.usage}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="空闲率" valueType="percent">
                {data?.cpu.free}
              </ProDescriptions.Item>
            </ProDescriptions>
          </ProCard>
          <ProCard colSpan={6} bodyStyle={{textAlign: 'center'}}>
            <Progress type="dashboard" size={135} percent={parseFloat(data?.cpu.usage as string)} strokeColor={colors}/>
          </ProCard>
        </ProCard>
        <ProCard gutter={[16, 0]} loading={loading}>
          <ProCard colSpan={18} bodyStyle={{padding: 0}}>
            <ProDescriptions
              className="custom-description-label-width-fixed-300"
              size="small"
              column={2}
              title="内存信息"
              bordered
              params={data?.memory}
              request={async () => {
                return Promise.resolve({
                  success: true,
                  data: data?.memory,
                });
              }}
              columns={[
                {
                  title: '总内存',
                  dataIndex: 'total',
                  render: (text) => `${text}G`,
                },
                {
                  title: '已使用内存',
                  dataIndex: 'usage',
                  render: (text) => `${text}G`,
                },
                {
                  title: 'PHP使用内存',
                  dataIndex: 'php',
                  render: (text) => `${text}M`,
                },
                {
                  title: '空闲内存',
                  dataIndex: 'free',
                  render: (text) => `${text}G`,
                },
                {
                  title: '使用率',
                  dataIndex: 'rate',
                  valueType: 'percent',
                },
              ]}
            />
          </ProCard>
          <ProCard colSpan={6} bodyStyle={{textAlign: 'center'}}>
            <Progress type="dashboard" size={135} percent={parseFloat(data?.memory.rate as string)}
                      strokeColor={colors}/>
          </ProCard>
        </ProCard>
        <ProCard gutter={[16, 0]} loading={loading}>
          <ProCard colSpan={24} bodyStyle={{padding: 0}}>
            <ProDescriptions
              className="custom-description-label-width-fixed-300"
              size="small"
              column={2}
              title="PHP及环境信息"
              bordered
              params={data?.phpenv}
              request={async () => {
                return Promise.resolve({
                  success: true,
                  data: {...data?.phpenv, ...data?.disk},
                });
              }}
              columns={[
                {
                  title: '操作系统',
                  dataIndex: 'os',
                },
                {
                  title: 'PHP版本',
                  dataIndex: 'php_version',
                },
                {
                  title: 'Swoole版本',
                  dataIndex: 'swoole_version',
                },
                {
                  title: 'Hyperf版本',
                  dataIndex: 'hyperf_version',
                },
                {
                  title: 'Core版本',
                  dataIndex: 'msproadmin_version',
                },
                {
                  title: '系统物理路径',
                  dataIndex: 'project_path',
                },
                {
                  title: '系统启动时间',
                  dataIndex: 'start_time',
                },
                {
                  title: '系统运行时间',
                  dataIndex: 'run_time',
                },
                {
                  title: '磁盘信息',
                  dataIndex: 'rate',
                  span: 2,
                  render: (_, record) => (
                    <Space>
                      <span>总空间：{record.total}</span>
                      <Divider type="vertical"/>
                      <span>已使用：{record.usage}</span>
                      <Divider type="vertical"/>
                      <span>已剩余：{record.free}</span>
                      <Divider type="vertical"/>
                      <span>使用率：{record.rate}</span>
                    </Space>
                  ),
                },
              ]}
            />
          </ProCard>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
