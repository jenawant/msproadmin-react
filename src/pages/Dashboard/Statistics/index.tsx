/* eslint-disable no-param-reassign */
import { useModel } from '@umijs/max';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import React from 'react';
import NormalPanel from '../normal';
import AdminPanel from './admin';

export default () => {
  const { initialState } = useModel('@@initialState');

  // 管理员面板.ADD.JENA.20230428
  if (
    initialState?.CurrentInfo?.roles.includes('superAdmin') ||
    initialState?.CurrentInfo?.roles.includes('admin')
  ) {
    return <AdminPanel />;
  } else {
    // 普通面板
    return <NormalPanel CurrentInfo={initialState?.CurrentInfo} />;
  }
};
