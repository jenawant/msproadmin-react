import common from '@/services/api/common';
import tool from '@/services/tool';
import { ImportOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-components';
import { Access, useAccess, useIntl } from '@umijs/max';
import { Alert, Button, message as Message } from 'antd';
import React from 'react';

export default (props: {
  CRUD: any;
  actionRef: React.MutableRefObject<ActionType | undefined>;
}) => {
  const [message, contextHolder] = Message.useMessage();
  const access = useAccess();
  const intl = useIntl();

  return (
    <Access key="access-import" accessible={access.check(props.CRUD.import.auth)}>
      {contextHolder}
      <ModalForm
        key="import"
        title={intl.formatMessage({ id: 'component.form.title.import' })}
        width={350}
        trigger={
          <Button key="import" shape="round" icon={<ImportOutlined />}>
            {intl.formatMessage({ id: 'component.form.button.import' })}
          </Button>
        }
        submitter={{
          searchConfig: {
            resetText: intl.formatMessage({ id: 'component.form.button.cancel' }),
            submitText: intl.formatMessage({ id: 'component.form.button.ok' }),
          },
        }}
        onFinish={async (values) => {
          const formData = new FormData();
          formData.append('file', values.import[0].originFileObj);

          const res = await common.importExcel(props.CRUD.import.url, formData);
          if (res.success) {
            message.success(
              res.message || intl.formatMessage({ id: 'component.form.button.import.success' }),
            );
            props.actionRef?.current?.reload();
            return true;
          } else {
            message.error(
              res.message || intl.formatMessage({ id: 'component.form.button.import.failure' }),
            );
            return false;
          }
        }}
        modalProps={{
          maskClosable: false,
          destroyOnClose: true,
        }}
      >
        <Alert
          message={
            <span>
              {intl.formatMessage({ id: 'component.form.button.import.download_template' })}
              <Button
                type="link"
                onClick={async () => {
                  common
                    .download(props.CRUD.import.templateUrl)
                    .then((res) => {
                      message.success(
                        intl.formatMessage({ id: 'component.form.download.success' }),
                      );
                      tool.download(res as any);
                    })
                    .catch(() => {
                      message.error(intl.formatMessage({ id: 'component.form.download.failure' }));
                    });
                }}
              >
                {intl.formatMessage({ id: 'component.form.button.import.download_button' })}
              </Button>
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 15 }}
        />
        <ProFormUploadDragger
          max={1}
          label=""
          name="import"
          title={intl.formatMessage({ id: 'component.form.button.import.upload_tips' })}
          description={intl.formatMessage(
            { id: 'component.form.button.import.upload_format' },
            { format: '.xls/.xlsx' },
          )}
          accept=".xls,.xlsx"
          fieldProps={{
            beforeUpload: (file) => {
              const isValid =
                file.type.indexOf('vnd.ms-excel') < 0 ||
                file.type.indexOf('vnd.openxmlformats') < 0;
              if (!isValid) {
                message.error(
                  intl.formatMessage({ id: 'component.form.button.import.upload_format' }),
                );
              }
              const isLt2M = file.size / 1024 / 1024 < 2;
              if (!isLt2M) {
                message.error(
                  intl.formatMessage(
                    { id: 'component.form.button.import.upload_size' },
                    { size: '2MB' },
                  ),
                );
              }
              return isValid && isLt2M;
            },
          }}
        />
      </ModalForm>
    </Access>
  );
};
