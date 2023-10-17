import { Access, useAccess, useIntl } from '@umijs/max';
import { Button } from 'antd';
import React from 'react';

export default (props: {
  CRUD: any;
  btnText?: string;
  type?: 'primary' | 'dashed' | 'link' | 'text' | 'default';
  onClick?: () => void;
}) => {
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-edit" accessible={access.check(props.CRUD.edit.auth)}>
      <Button
        size="small"
        key="edit"
        type={props.type ?? 'primary'}
        onClick={() => props.onClick?.()}
        shape="round"
      >
        {props.btnText ?? intl.formatMessage({ id: 'component.form.button.edit' })}
      </Button>
    </Access>
  );
};
