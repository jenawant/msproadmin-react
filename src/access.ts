/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { CurrentInfo?: API.CurrentInfo } | undefined) {
  const { CurrentInfo } = initialState ?? {};
  return {
    canAdmin: CurrentInfo && CurrentInfo.roles.includes('admin'),
    check: (code: string) =>
      (CurrentInfo?.codes.includes('*') || CurrentInfo?.codes.includes(code)) ?? false, //按钮级权限控制
  };
}
