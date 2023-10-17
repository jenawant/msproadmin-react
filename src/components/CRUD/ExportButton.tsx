import common from '@/services/api/common';
import tool from '@/services/tool';
import { ExportOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { Access, useAccess, useIntl } from '@umijs/max';
import { Button, message as Message } from 'antd';
import React from 'react';

export default (props: {
  CRUD: any;
  searchFormRef?: React.MutableRefObject<ProFormInstance | undefined>;
}) => {
  const [message, contextHolder] = Message.useMessage();
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-export" accessible={access.check(props.CRUD.export.auth)}>
      {contextHolder}
      <Button
        key="export"
        shape="round"
        icon={<ExportOutlined />}
        onClick={() => {
          common
            .download(
              props.CRUD.export.url,
              'post',
              props?.searchFormRef?.current?.getFieldsFormatValue?.(),
            )
            .then((res) => {
              message.success(intl.formatMessage({ id: 'component.form.download.success' }));
              tool.download(res as any);
            })
            .catch(() => {
              message.error(intl.formatMessage({ id: 'component.form.download.failure' }));
            });
        }}
      >
        {intl.formatMessage({ id: 'component.form.button.export' })}
      </Button>
    </Access>
  );
};
