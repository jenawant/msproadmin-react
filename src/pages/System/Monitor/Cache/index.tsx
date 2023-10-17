import { PageContainer, ProCard, ProDescriptions, ProList } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

import GaugeChart from '@/components/Charts/GaugeChart';
import monitorApi from '@/services/api/system/monitor';
import { ReloadOutlined } from '@ant-design/icons';
import { Button, message as Message, Popconfirm, Typography } from 'antd';

type CacheItem = {
  keys: string[];
  server: {
    version: string; //"3.2.100",
    redis_mode: string; //"单机",
    run_days: number; //21,
    aof_enabled: string; //"关闭",
    use_memory: string; //"935.07K",
    port: number; //6379,
    clients: number; //6,
    expired_keys: number; //70,
    sys_total_keys: number; //18
  };
};

export default () => {
  const [message, contextHolder] = Message.useMessage();
  const [data, setData] = useState<CacheItem | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const [cacheInfo, setCacheInfo] = useState<string>('');
  const [needRefresh, setNeedRefresh] = useState<number>(Math.random());

  useEffect(() => {
    monitorApi.getCacheInfo().then((res) => {
      setData(res.data);
      setLoading(false);
    });
    return () => {
      setData(undefined);
      setLoading(false);
    };
  }, [needRefresh]);

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
              title: '缓存监控',
            },
          ],
        },
      }}
    >
      {contextHolder}
      <ProCard
        direction="column"
        ghost
        gutter={[0, 16]}
        extra={
          <Button
            type="primary"
            shape="round"
            icon={<ReloadOutlined />}
            onClick={() => {
              setLoading(true);
              setNeedRefresh(Math.random());
            }}
            disabled={loading}
          >
            刷新
          </Button>
        }
      >
        <ProCard gutter={[16, 0]} loading={loading}>
          <ProCard colSpan={18} bodyStyle={{ padding: 0 }}>
            <ProDescriptions
              className="custom-description-label-width-fixed-300"
              size="small"
              column={2}
              title="Redis信息"
              tooltip="包含版本号、客户端数、Key数量等信息"
              bordered
              params={data?.server}
              request={async () => {
                return Promise.resolve({
                  success: true,
                  data: data?.server,
                });
              }}
              columns={[
                {
                  title: 'Redis版本',
                  dataIndex: 'version',
                },
                {
                  title: '客户端连接数',
                  dataIndex: 'clients',
                },
                {
                  title: '运行模式',
                  dataIndex: 'redis_mode',
                },
                {
                  title: '运行天数',
                  dataIndex: 'run_days',
                },
                {
                  title: '端口',
                  dataIndex: 'port',
                },
                {
                  title: 'AOF状态',
                  dataIndex: 'aof_enabled',
                },
                {
                  title: '已过期key',
                  dataIndex: 'expired_keys',
                },
                {
                  title: '系统使用key',
                  dataIndex: 'sys_total_keys',
                },
              ]}
            />
          </ProCard>
          <ProCard colSpan={6}>
            <GaugeChart
              datas={[{ name: 'Redis占用内存', value: parseFloat(data?.server.use_memory ?? '0') }]}
              range={[0, 5120]}
              unit="KB"
              style={{ height: 230 }}
            />
          </ProCard>
        </ProCard>
        <ProCard gutter={[16, 0]} loading={loading}>
          <ProCard colSpan={16} bodyStyle={{ padding: 0 }}>
            <ProList<any>
              size="small"
              pagination={{
                size: 'small',
                defaultPageSize: 100,
                showSizeChanger: true,
              }}
              metas={{
                title: { dataIndex: 'title' },
                avatar: { dataIndex: 'avatar' },
                actions: {
                  render: (_, record) => [
                    <Button
                      size="small"
                      type="link"
                      key="view"
                      onClick={async () => {
                        monitorApi.view({ key: record.title }).then((res) => {
                          if (!res.success) {
                            message.error(res.message);
                            return;
                          }

                          setCacheInfo(res.data.content);
                        });
                      }}
                    >
                      查看
                    </Button>,
                    <Popconfirm
                      key="popconfirm"
                      title="确定要删除吗？"
                      onConfirm={async () => {
                        monitorApi.deleteKey({ key: record.title }).then((res) => {
                          if (!res.success) {
                            message.error(res.message);
                            return;
                          }

                          message.success(res.message);
                          setNeedRefresh(Math.random());
                          setCacheInfo('');
                        });
                      }}
                    >
                      <Button size="small" type="link" danger>
                        删除
                      </Button>
                    </Popconfirm>,
                  ],
                },
              }}
              rowKey="title"
              headerTitle="缓存数据管理"
              params={data?.keys}
              request={async () => {
                return Promise.resolve({
                  success: true,
                  data: data?.keys.map((item) => ({
                    title: item,
                    avatar: 'https://gw.alipayobjects.com/zos/antfincdn/UCSiy1j6jx/xingzhuang.svg',
                  })),
                });
              }}
              style={{ marginInline: -24 }}
            />
          </ProCard>
          <ProCard colSpan={8} bodyStyle={{ maxHeight: 520, overflow: 'hidden auto' }}>
            <Typography>
              <Typography.Paragraph>{cacheInfo}</Typography.Paragraph>
            </Typography>
          </ProCard>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
};
