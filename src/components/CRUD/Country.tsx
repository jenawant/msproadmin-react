import common from '@/services/api/common';
import { ProFormSelect } from '@ant-design/pro-components';
import { getLocale } from '@umijs/max';
import React, { useEffect, useState } from 'react';

export default (props: {
  initialValue?: any;
  fieldProps?: any;
  formItemProps?: any;
}) => {
  const lang = getLocale();
  const [options, setOptions] = useState<any[]>([]);
  useEffect(() => {
    const fetch = async () => {
      if (props?.fieldProps?.options) {
        setOptions(props?.fieldProps?.options);
        return;
      }
      const res = await common.getCountry();
      setOptions(
        res.data.map((item: any) => ({
          label: `[${item.code}][${item.phone_code}] ${
            lang === 'cn-ZH' ? item.name : item.en_name
          }`,
          value: item.id,
          searchLabel: `[${item.code}][${item.phone_code}] ${
            lang === 'cn-ZH' ? item.name : item.en_name
          }`,
        })),
      );
    };
    fetch();
    return () => {
      setOptions([]);
    };
  }, [lang, props?.fieldProps?.options]);
  return props.initialValue ? (
    options?.find((item: any) => item.value === props.initialValue)?.label ?? null
  ) : (
    <ProFormSelect
      name={props.fieldProps.id}
      params={{ options }}
      request={async () => options}
      showSearch={true}
      fieldProps={{
        optionFilterProp: 'children',
        filterOption: (input: string, option: any) =>
          (option?.searchLabel ?? option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
        allowClear: true,
        ...props.fieldProps,
      }}
      {...props.formItemProps}
      noStyle
    />
  );
};
