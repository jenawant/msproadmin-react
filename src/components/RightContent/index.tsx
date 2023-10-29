import {useModel} from '@umijs/max';
import {App, Space} from 'antd';
import React from 'react';
import NoticeIcon from '../NoticeIcon/index';
import SelectLang from '../SelectLang';
import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const {initialState} = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const {navTheme, layout} = initialState.settings;
  let className = styles.right;

  if ((navTheme === 'realDark' && layout === 'top') || layout === 'mix') {
    className = `${styles.right}  ${styles.dark}`;
  }
  return (
    <App>
      <Space className={className} size={24}>
        <NoticeIcon/>
        <SelectLang/>
        <Avatar
          menu={initialState.CurrentInfo && initialState.CurrentInfo?.roles.includes('merchant')}
        />
      </Space>
    </App>
  );
};
export default GlobalHeaderRight;
