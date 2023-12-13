import common from "@/services/api/common";
import { ProFormRadio, ProFormSelect } from "@ant-design/pro-components";
import React, { useEffect, useState } from "react";

export default (props: {
  initialValue?: any;
  fieldProps?: any;
  formItemProps?: any;
}) => {
  const [options, setOptions] = useState<any[]>([]);
  useEffect(() => {
    const fetch = async (params: any) => {
      if (props?.fieldProps?.options) {
        setOptions(props?.fieldProps?.options);
        return;
      }
      const res = await common.getDict(params);
      setOptions(res.data);
    };
    fetch(props.fieldProps.dict);
    return () => {
      setOptions([]);
    };
  }, [props.fieldProps.dict, props?.fieldProps?.options]);
  return props.initialValue ? (
    options?.find((item: any) => item.key === props.initialValue.toString?.())
      ?.title ?? null
  ) : props.fieldProps.type === "select" ? (
    <ProFormSelect
      name={props.fieldProps.id}
      params={{ ...options }}
      request={async () =>
        options
          .map((item: any) => ({
            label: item[props.fieldProps.fieldNames.label],
            value: item[props.fieldProps.fieldNames.value],
          }))
          .map((item: any) => ({
            label: item.label,
            value: /^\d+$/.test(item.value) ? Number(item.value) : item.value, //数字字符串转为数字
          }))
      }
      showSearch={props.fieldProps.showSearch}
      mode={props.fieldProps.multiple ? "multiple" : "single"}
      fieldProps={{
        optionFilterProp: "children",
        filterOption: (input: string, option: any) =>
          (option?.searchLabel ?? option?.label ?? "")
            .toLowerCase()
            .includes(input.toLowerCase()),
        allowClear: true,
      }}
      {...props.formItemProps}
      noStyle
    />
  ) : (
    <ProFormRadio.Group
      name={props.fieldProps.id}
      params={{ ...options }}
      request={async () =>
        options
          .map((item: any) => ({
            label: item[props.fieldProps.fieldNames.label],
            value: item[props.fieldProps.fieldNames.value],
          }))
          .map((item: any) => ({
            label: item.label,
            value: /^\d+$/.test(item.value) ? Number(item.value) : item.value, //数字字符串转为数字
          }))
      }
      {...props.formItemProps}
      noStyle
    />
  );
};
