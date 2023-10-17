import type { ActionType } from '@ant-design/pro-components';
import { Access, useAccess, useIntl } from '@umijs/max';
import { Button, message as Message, Popconfirm } from 'antd';
import React from 'react';

export default (props: {
  CRUD: any;
  id: number;
  actionRef: React.MutableRefObject<ActionType | undefined>;
}) => {
  const [message, contextHolder] = Message.useMessage();
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-delete" accessible={access.check(props.CRUD.delete.auth)}>
      {contextHolder}
      <Popconfirm
        key="popconfirm"
        title={intl.formatMessage({ id: 'component.form.button.tipsdelete' })}
        onConfirm={async () => {
          const result = await props.CRUD.delete.api({
            ids: [props.id],
          });
          if (result.success) {
            message.success(result.message);
            props.actionRef?.current?.reload?.();
          } else {
            message.error(result.message);
          }
        }}
        // okText="确认"
        // cancelText="取消"
      >
        <Button size="small" key="delete" danger shape="round">
          {intl.formatMessage({ id: 'component.form.button.delete' })}
        </Button>
      </Popconfirm>
    </Access>
  );
};
