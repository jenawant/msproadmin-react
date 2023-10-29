import Footer from '@/components/Footer';
import RightContent from '@/components/RightContent';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { PageLoading, ProConfigProvider } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Navigate } from '@umijs/max';
import React from 'react';

import defaultSettings from '@/../config/defaultSettings';
import IconMap from '@/../config/icons';

import { errorConfig } from './requestErrorConfig';

import Country from './components/CRUD/Country';
import Dict from './components/CRUD/Dict';
import Upload from './components/CRUD/Upload';
import login from './services/api/login';
import tool from './services/tool';

const loginPath = '/login';
const allowWithoutLoginPath = [loginPath];

interface IInitialState {
  settings?: Partial<LayoutSettings>;
  CurrentInfo?: API.CurrentInfo;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentInfo | undefined>;
}
/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<IInitialState> {
  const fetchUserInfo = async () => {
    try {
      const msg = await login.getInfo();
      // 设置了用户首页及有控制台菜单权限，重置首页及根路由，否则移除控制台路由
      if (
        msg.data.user.dashboard &&
        msg.data.routers.some((item: any) => item.name === 'dashboard')
      ) {
        msg.data.routers = msg.data.routers.map((item: any) => {
          if (item.name === 'dashboard') {
            return {
              ...item,
              path: `/${msg.data.user.dashboard}`,
              component: item.children.find((chd: any) => chd.name === msg.data.user.dashboard)
                .component,
              children: null,
              redirect: null,
            };
          }
          return item;
        });
        msg.data.routers.push({
          name: 'root',
          path: '/',
          redirect: `/${msg.data.user.dashboard}`,
          meta: { breadcrumb: [] },
        });
      } else {
        msg.data.routers = msg.data.routers.filter((item: any) => item.name != 'dashboard');
      }
      // 把路由数据更新到本地
      tool.local.set(
        '_routers',
        tool.rc4(JSON.stringify(msg.data.routers), '+fRpHW6QEaY0{:~#?!)z7d|TxCOIN.l*'),
      );
      return msg.data;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  if (!allowWithoutLoginPath.some((path: string) => window.location.pathname.indexOf(path) >= 0)) {
    const CurrentInfo = await fetchUserInfo();

    return {
      fetchUserInfo,
      CurrentInfo,
      settings: defaultSettings,
    };
  }
  return {
    fetchUserInfo,
    settings: defaultSettings,
  };
}

const loopMenuItem = (menus: any[]): MenuDataItem[] =>
  menus
    .filter((menu) => menu.meta.type === 'M')
    .map(({ name, meta, children, ...item }) => ({
      ...item,
      key: name,
      name: meta.title,
      icon: meta.icon && IconMap[meta.icon as string],
      hideInMenu: meta.hidden,
      children: children && loopMenuItem(children),
    }));

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState }: { initialState?: IInitialState }) => {
  return {
    rightContentRender: () => <RightContent />,
    waterMarkProps: {
      content: '', //initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.CurrentInfo?.user && !allowWithoutLoginPath.some((path: string) => location.pathname.indexOf(path) >= 0)) {
        history.push(loginPath);
      }
    },
    layoutBgImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    // links: isDev
    //   ? [
    //       <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
    //         <LinkOutlined />
    //         <span>OpenAPI 文档</span>
    //       </Link>,
    //     ]
    //   : [],
    menu: {
      locale: false,
      params: initialState,
      request: async () => loopMenuItem(initialState?.CurrentInfo?.routers ?? []),
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (
      children:
        | boolean
        | React.ReactChild
        | React.ReactFragment
        | React.ReactPortal
        | null
        | undefined,
    ) => {
      if (initialState?.loading) return <PageLoading />;
      return (
        // 自定义valueType.ADD.JENA.20230706
        <ProConfigProvider
          valueTypeMap={{
            dict: {
              render: (_, property) => (
                <Dict initialValue={property.text} fieldProps={{ ...property?.fieldProps }} />
              ),
              renderFormItem: (_, property) => <Dict fieldProps={{ ...property?.fieldProps }} />,
            },
            country: {
              render: (_, property) => (
                <Country initialValue={property.text} fieldProps={{ ...property?.fieldProps }} />
              ),
              renderFormItem: (_, property) => <Country fieldProps={{ ...property?.fieldProps }} />,
            },
            upload: {
              render: (_, property) => (
                <Upload initialValue={property.text} fieldProps={{ ...property?.fieldProps }} />
              ),
              renderFormItem: (_, property) => <Upload fieldProps={{ ...property?.fieldProps }} />,
            },
          }}
        >
          {children}
        </ProConfigProvider>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

/**
 * 动态路由处理
 */
let extraRoutes: any;

const rebuildRoutes = (routes: any[]) => {
  if (!Array.isArray(routes)) return [];
  return routes
    .map((route) => {
      if (route.redirect) {
        return {
          id: route.id,
          path: route.path,
          name: route.name,
          component: () => <Navigate to={route.redirect} />,
        };
      }

      const componentPath = route.component
        .split('/')
        .map((w: string, i: number, a: any[]) => (i !== a.length - 1 ? tool.UCFirst(w) : w))
        .join('/');
      return {
        id: route.id,
        path: route.path,
        name: route.name,
        component: React.lazy(() => import(`@/pages/${componentPath}`)),
      };
    })
    .map((route) => {
      return {
        id: route.id,
        path: route.path,
        name: route.name,
        element: <route.component />,
      };
    });
};
export function patchClientRoutes(object: any) {
  const { routes } = object;
  if (extraRoutes) {
    const root = routes.find((item: any) => item.id === 'ant-design-pro-layout');
    if (extraRoutes.some((item: any) => item.name === 'dashboard')) {
      // 已设置用户首页，移除默认路由/及跳转
      root.routes.pop();
      root.routes.pop();
    }
    root.routes.push(...extraRoutes);
  }
}
export function render(oldRender: () => void) {
  // 获取本地路由并修正redirect，打平后重构路由
  const localRoutes =
    JSON.parse(tool.rc4(tool.local.get('_routers'), '+fRpHW6QEaY0{:~#?!)z7d|TxCOIN.l*'))?.map(
      (item: any) => {
        if (
          item.redirect &&
          item.children &&
          !item.children.some((sub: any) => sub.path === item.redirect)
        ) {
          item.redirect = item.children[0].path;
        }
        return item;
      },
    ) ?? [];
  extraRoutes = rebuildRoutes(
    tool
      .flatAsyncRoutes(localRoutes)
      .filter((route) => route.meta.type !== 'B' && (route.component || route.redirect)),
  );
  oldRender();
}
