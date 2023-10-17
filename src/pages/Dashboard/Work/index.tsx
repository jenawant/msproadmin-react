import { useModel } from '@umijs/max';
import React from 'react';

import NormalPanel from '../normal';

const Welcome: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  return <NormalPanel CurrentInfo={initialState?.CurrentInfo} />;
};

export default Welcome;
