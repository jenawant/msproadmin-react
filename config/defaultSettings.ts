import { Settings as LayoutSettings } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: LayoutSettings & {
  pwa?: boolean;
  logo?: string;
  token?: any;
} = {
  navTheme: 'light',
  // 拂晓蓝
  colorPrimary: '#36cfc9',
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: true,
  colorWeak: false,
  title: '',
  pwa: false,
  logo: '/logo.svg',
  iconfontUrl: '',
  token: {
    layout: {
      bgLayout: '#ff0000',
    },
    header: {
      colorBgHeader: '#2a3042',
      colorTextMenu: '#FFFFFF',
      colorTextMenuActive: '#36cfc9',
      colorTextMenuSelected: '#36cfc9',
      colorTextMenuSecondary: '#36cfc9',
      colorTextRightActionsItem: '#FFFFFF',
      heightLayoutHeader: 70,
    },
  },
};

export default Settings;
