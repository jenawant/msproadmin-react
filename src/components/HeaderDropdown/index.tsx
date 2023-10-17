import { Dropdown } from 'antd';
import type { MenuProps, DropDownProps } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

export type HeaderDropdownProps = {
  overlayClassName?: string;
  menu: MenuProps;
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topCenter' | 'topRight' | 'bottomCenter';
} & Omit<DropDownProps, 'overlay'>;

const HeaderDropdown: React.FC<HeaderDropdownProps> = ({ overlayClassName: cls, ...restProps }) => (
  <Dropdown
    overlayClassName={classNames(styles.container, cls)}
    getPopupContainer={(target) => target.parentElement || document.body}
    {...restProps}
  />
);

export default HeaderDropdown;