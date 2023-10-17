import Skeleton from '@ant-design/pro-skeleton';
import { useLocation } from '@umijs/max';
import { Spin } from 'antd';

export default () => {
  const location = useLocation();
  return location.pathname === '/login' ? (
    <div style={{ padding: 300, textAlign: 'center', verticalAlign: 'middle' }}>
      <Spin size="large" />
    </div>
  ) : (
    <div style={{ padding: 30 }}>
      <Skeleton type="list" />
    </div>
  );
};
