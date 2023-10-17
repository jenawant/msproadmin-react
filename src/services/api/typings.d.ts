// @ts-ignore
/* eslint-disable */

declare namespace API {
  type route = {
    id: number; //1101,
    parent_id: number; //1100,
    name: string; //"system:user:index",
    component: string; //null,
    path: string; //"/",
    redirect: string; //null,
    meta: {
      type: string; //"B",
      icon: string; //null,
      title: string; //"用户列表",
      hidden: boolean; //true,
      hiddenBreadcrumb: boolean; //false
    };
    children: route[];
  };
  type routers = route[];
  type roles = [string];
  type codes = [string];
  type user = {
    id: number; //1,
    username: string; //"admin",
    user_type: string; //"100",
    nickname: string; //"超级管理员",
    phone: string; //"16858888988",
    email: string; //"admin@adminmine.com",
    avatar: string; //null,
    signed: string; //"广阔天地，大有所为",
    dashboard: string; //"statistics",
    dept_id: number; //1;
    merchant_id: number;
    merchant: any;
    status: number; //1;
    login_ip: string; //'172.17.0.1';
    login_time: string; //'2022-11-11 10:51:23';
    backend_setting: object; //null,
    created_by: number; //0,
    updated_by: number; //0,
    created_at: string; //"2022-11-10 15:59:00",
    updated_at: string; //"2022-11-11 10:51:23",
    remark: string; //null
  };

  type CurrentInfo = {
    codes: codes;
    roles: roles;
    routers: routers;
    user: user;
  };

  type LoginResult = {
    success?: boolean;
    code?: string;
    message?: string;
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    username?: string;
    password?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type CommonResponse = {
    /** 业务约定的错误码 */
    code: number;
    /** 业务上的错误信息 */
    message?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
    /** 业务上返回的数据 */
    data: any;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notice' | 'announcement' | 'private_message' | 'todo';

  type NoticeIconItem = {
    id: number; //3,
    key: number; //
    content_id: number; //null,
    content_type: string; //"notice",
    title: string; //"test",
    send_by: number; //1,
    content: string; //"<p>aaaaaaa</p>",
    created_by: number; //1,
    updated_by: number; //1,
    created_at: string; //"2023-02-10 17:20:20",
    updated_at: string; //"2023-02-10 17:20:20",
    remark: string; //null,
    send_user: {
      id: number; //1,
      username: string; //"admin",
      nickname: string; //"超级管理员",
      avatar: any; //"http://127.0.0.1:9501/uploadfile/20221130/456469317815373824.jpg"
    };
    extra: any;
    status: string;
    read?: boolean;
  };
}
