import { PlusOutlined } from '@ant-design/icons';
import { Access, useAccess, useIntl } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';

export default (props: { CRUD: any; onClick: (status: boolean) => void; btnText?: string }) => {
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-add" accessible={access.check(props.CRUD.add.auth)}>
      <Button
        key="button"
        type="primary"
        shape="round"
        icon={<PlusOutlined />}
        onClick={() => {
          props.onClick(true);
        }}
      >
        {props.btnText ?? intl.formatMessage({ id: 'component.form.button.add' })}
      </Button>
    </Access>
  );
};
