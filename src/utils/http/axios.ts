import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from 'axios';
import type { Response } from './types';
// import { auth } from '@/utils';
import { Toast } from 'vant';
import router from '@/router';

axios.defaults.timeout = 1000 * 60;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

// 创建axios实例
const service = axios.create({
  // 根据不同env设置不同的baseURL
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
});

// axios实例拦截请求
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    config.headers = {
      ...config.headers,
      // ...auth.headers(), // 你的自定义headers，如token等
    };
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// axios实例拦截响应
service.interceptors.response.use(
  // 2xx时触发
  (response: AxiosResponse<Response>) => {
    // response.data就是后端返回的数据，结构根据你们的约定来定义
    const { code, message } = response.data;
    let errMessage = '';
    switch (code) {
      case 0:
        break;
      case 1: // token过期
        errMessage = 'Token expired';
        router.push('/login');
        break;
      case 2: // 无权限
        errMessage = 'No permission';
        break;
      default:
        errMessage = message;
        break;
    }
    if (errMessage) Toast.fail(errMessage);
    return response;
  },
  // 非2xx时触发
  (error: AxiosError) => {
    Toast.fail('Network Error...');
    return Promise.reject(error);
  }
);

export type { AxiosResponse, AxiosRequestConfig };

export default service;
