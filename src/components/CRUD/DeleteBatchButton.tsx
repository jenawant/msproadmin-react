import type { ActionType } from '@ant-design/pro-components';
import { Access, useAccess, useIntl } from '@umijs/max';
import { Button, message as Message, Popconfirm } from 'antd';
import React from 'react';

export default (props: {
  CRUD: any;
  ids: (string | number)[];
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  onFinish?: () => void;
}) => {
  const [message, contextHolder] = Message.useMessage();
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-delete" accessible={access.check(props.CRUD.delete.auth)}>
      {contextHolder}
      <Popconfirm
        key="popconfirm"
        title={intl.formatMessage({ id: 'component.form.button.tipsbatchdelete' })}
        onConfirm={async () => {
          const result = await props.CRUD.delete.api({
            ids: props.ids,
          });
          if (result.success) {
            message.success(result.message);
            props.actionRef?.current?.reload?.();
            props?.onFinish?.();
          } else {
            message.error(result.message);
          }
        }}
        // okText="确认"
        // cancelText="取消"
      >
        <Button type="link">
          {intl.formatMessage({ id: 'component.form.button.batchdelete' })}
        </Button>
      </Popconfirm>
    </Access>
  );
};
