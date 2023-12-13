import common from "@/services/api/common";
import tool from "@/services/tool";
import { ProFormUploadButton } from "@ant-design/pro-components";
import { useIntl } from "@umijs/max";
import { Image as AntImage, message as Message } from "antd";
import file2md5 from "file2md5";
import React from "react";

const storageMode = {
  "1": "LOCAL",
  "2": "OSS",
  "3": "COS",
  "4": "QINIU",
};

/**
 * 表单中对应字段返回单个值或对象，回填时需要预处理
 */
export default (props: {
  initialValue?: any;
  fieldProps?: any;
  formItemProps?: any;
  hasWebToken?: string | undefined;
}) => {
  const [message, contextHolder] = Message.useMessage();
  const intl = useIntl();

  if (props.initialValue) {
    return props.fieldProps.type === "image" ? (
      <AntImage
        src={props.initialValue}
        style={props.fieldProps?.style ?? undefined}
      />
    ) : null;
  } else {
    return (
      <>
        {contextHolder}
        <ProFormUploadButton
          title={intl.formatMessage({ id: "component.form.button.upload" })}
          name={props.fieldProps.id}
          max={
            !props.fieldProps.multiple ? 1 : props.fieldProps?.max ?? undefined
          }
          accept={
            props.fieldProps.type === "image" && props.fieldProps.accept !== "*"
              ? ".jpg,jpeg,.gif,.png,.svg,.bpm"
              : props.fieldProps.accept
          }
          fieldProps={{
            name: "file",
            fileList: props.fieldProps?.value ?? [],
            listType:
              props.fieldProps.type === "image" ? "picture-card" : undefined,
            customRequest: async ({ file, onSuccess, onError }) => {
              const hash = await file2md5(file as any);
              const formData = new FormData();
              formData.append(props.fieldProps.type, file);
              formData.append("isChunk", "false");
              formData.append("hash", hash);
              if (props.hasWebToken) {
                formData.append("token", props.hasWebToken);
              }
              const msg =
                props.fieldProps.type === "image"
                  ? await common.uploadImage(formData, !!props?.hasWebToken)
                  : await common.uploadFile(formData, !!props?.hasWebToken);
              if (msg.success) {
                msg.data.url = tool.attachUrl(
                  msg.data.url,
                  storageMode[msg.data.storage_mode]
                );
                onSuccess?.(
                  props.fieldProps.onlyData
                    ? msg.data[props.fieldProps.returnType]
                    : msg.data
                );
              } else {
                message.error(msg.message);
                onError?.({ method: "POST" } as any);
              }
            },
            onPreview: async (file) => {
              let src = file.url;
              if (!src) {
                src = (await new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(file.originFileObj as any);
                  reader.onload = () => resolve(reader.result as any);
                })) as string;
              }
              const image = new Image();
              image.src = src;
              const imgWindow = window.open(src);
              imgWindow?.document.write(image.outerHTML);
            },
          }}
          colProps={{ span: 24 }}
          noStyle
        />
      </>
    );
  }
};
