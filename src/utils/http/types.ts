/* eslint-disable @typescript-eslint/no-explicit-any */

// 和后端约定好接口返回的数据结构
export interface Response<T = any> {
  code: number | string;
  message: string;
  result: T;
}
