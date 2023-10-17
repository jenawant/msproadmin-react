import type { FormInstance } from 'antd';
import { Drawer, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

import type { ColumnItem } from '@/pages/System/App/index';
import apiGroup from '@/services/api/system/apiGroup';
import app from '@/services/api/system/app';
import { ProCard, ProForm, ProFormCheckbox } from '@ant-design/pro-components';

type ApiType = {
  id: number;
  group_id: number;
  access_name: string;
  name: string;
};
type ApiGroupType = {
  id: number; //主键
  name: string;
  apis: ApiType[];
};

export type FormProps = {
  onCancel: (flag?: boolean) => void;
  modalVisible: boolean;
  currentRow?: ColumnItem;
  actionRef?: any;
};

/**
 *
 * @param props
 * @constructor
 */
const Bind: React.FC<FormProps> = (props) => {
  const [apiGroupData, setApiGroupData] = useState<ApiGroupType[]>([]);
  const formRef = useRef<FormInstance>();

  useEffect(() => {
    const fetch = async () => {
      const response = await apiGroup.getSelectList({ getApiList: true });
      setApiGroupData(response.data);
    };
    fetch();
    return () => {
      setApiGroupData([]);
    };
  }, [props.currentRow?.id]);

  return (
    <Drawer
      title="业务绑定"
      width={700}
      open={props.modalVisible}
      onClose={() => {
        // delete props.currentRow;
        props.onCancel();
      }}
      closable={false}
      destroyOnClose={true}
    >
      <ProForm<{
        name: string;
        company?: string;
        useMode?: string;
      }>
        formRef={formRef}
        onFinish={async (values: any) => {
          if (!props?.currentRow?.id) return;

          const response = await app.bind(props.currentRow.id, values);
          if (response.success) {
            message.success(response.message);
            props?.actionRef?.current?.reload();
            return;
          }
          message.success('提交成功');
        }}
        initialValues={{
          SMS: {
            apis:
              props?.currentRow?.apis
                ?.filter((item: any) => item.api_group.name === 'SMS')
                ?.map((item: any) => item.id) ?? [],
            products: props?.currentRow?.merchant_product?.map((item: any) => item.id) ?? [],
          },
          VOICE: {
            apis:
              props?.currentRow?.apis
                ?.filter((item: any) => item.api_group.name === 'VOICE')
                ?.map((item: any) => item.id) ?? [],
            products: [],
          },
          EMAIL: {
            apis:
              props?.currentRow?.apis
                ?.filter((item: any) => item.api_group.name === 'EMAIL')
                ?.map((item: any) => item.id) ?? [],
            products: [],
          },
        }}
        params={{}}
      >
        {apiGroupData.map((item: ApiGroupType) => {
          return (
            <ProCard
              key={item.id}
              tabs={{
                items: [
                  {
                    label: '接口',
                    key: 'api',
                    children: (
                      <ProFormCheckbox.Group
                        name={[item.name, 'apis']}
                        params={{ group_id: item.id }}
                        request={async () =>
                          item.apis.map((api: any) => ({ label: api.name, value: api.id }))
                        }
                      />
                    ),
                  },
                  {
                    label: '产品',
                    key: 'product',
                    children: <></>,
                  },
                ],
              }}
              title={`${item.name}`}
              size="small"
              bordered
              style={{ marginBlockEnd: 16 }}
            />
          );
        })}
      </ProForm>
    </Drawer>
  );
};

export default Bind;
