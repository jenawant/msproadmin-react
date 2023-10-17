import { getAllLocales, getLocale, setLocale } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Dropdown, Image } from 'antd';
import React, { useEffect, useState } from 'react';

import chinese from '../../public/images/flags/chinese.jpg';
import english from '../../public/images/flags/us.jpg';

const locales = {
  'zh-CN': {
    icon: (
      <Image
        height={16}
        src={chinese}
        preview={false}
        style={{ display: 'inherit', marginInlineEnd: 0, marginRight: 5, width: 'auto' }}
      />
    ),
    label: '简体中文',
  },
  'en-US': {
    icon: (
      <Image
        height={16}
        src={english}
        preview={false}
        style={{ display: 'inherit', marginInlineEnd: 0, marginRight: 5, width: 'auto' }}
      />
    ),
    label: 'English',
  },
};
export default () => {
  const [langs, setLangs] = useState<MenuProps['items']>([]);
  const [lang, setLang] = useState<string>('zh-cn');

  const onClick: MenuProps['onClick'] = ({ key }) => {
    setLocale(key, false);
    setLang(key);
  };

  useEffect(() => {
    const items: MenuProps['items'] = getAllLocales()
      .filter((item) => Object.keys(locales).includes(item))
      .map((item) => ({
        label: locales[item].label,
        key: item,
        icon: locales[item].icon,
      }));
    setLangs(items);
    setLang(getLocale());
    return () => {
      setLangs([]);
      setLang('zh-cn');
    };
  }, []);
  return (
    <Dropdown
      menu={{ items: langs, onClick }}
      trigger={['hover']}
      overlayStyle={{ cursor: 'pointer' }}
    >
      <span style={{ cursor: 'pointer' }}>{locales?.[lang]?.icon}</span>
    </Dropdown>
  );
};
