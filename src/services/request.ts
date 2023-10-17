import { request as reqFunction } from '@umijs/max';

export async function request(obj: any) {
  const { url } = obj;
  delete obj.url;
  return reqFunction(url, { ...obj }) as unknown as API.CommonResponse & {
    headers: Record<string, string>;
  };
}
