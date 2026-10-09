/**
 * 类型化的 API 客户端：统一前缀、租户标识、错误码映射与重试策略。
 */

const API_PREFIX = '/app-api';
const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? '1';

/** 后端规范响应：code=0 表示成功 */
export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

/** 已映射为可读文案的 API 错误 */
export class ApiClientError extends Error {
  readonly code: number;
  readonly status: number;

  constructor(code: number, message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

/** 把后端错误码翻译成用户能看懂的话 */
function toFriendlyMessage(code: number, msg: string, status: number): string {
  if (status === 401 || code === 401) {
    return '登录已失效，请重新登录';
  }
  if (status === 403) {
    return '没有访问该内容的权限';
  }
  if (status === 404) {
    return '请求的内容不存在';
  }
  if (status >= 500) {
    return '服务开小差了，请稍后再试';
  }
  if (status === 0) {
    return '网络连接失败，请检查网络后重试';
  }
  return msg || '请求失败，请稍后再试';
}

type QueryParams = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  params?: QueryParams;
  signal?: AbortSignal;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const url = `${API_PREFIX}${path}`;
  if (!params) {
    return url;
  }
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${url}?${query}` : url;
}

async function request<T>(
  path: string,
  options: RequestOptions & { init?: RequestInit; retries?: number } = {},
): Promise<T> {
  const { params, signal, init, retries = 2 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(buildUrl(path, params), {
        ...init,
        signal,
        headers: {
          'Content-Type': 'application/json',
          'tenant-id': String(TENANT_ID),
          ...init?.headers,
        },
      });

      const payload = (await response.json()) as ApiResponse<T>;
      // 4xx 不重试，直接抛出可读错误
      if (response.status >= 400 && response.status < 500) {
        throw new ApiClientError(
          payload?.code ?? response.status,
          toFriendlyMessage(payload?.code ?? 0, payload?.msg ?? '', response.status),
          response.status,
        );
      }
      if (response.status >= 500) {
        throw new ApiClientError(
          payload?.code ?? response.status,
          toFriendlyMessage(payload?.code ?? 0, payload?.msg ?? '', response.status),
          response.status,
        );
      }
      if (payload.code !== 0) {
        throw new ApiClientError(
          payload.code,
          toFriendlyMessage(payload.code, payload.msg, response.status),
          response.status,
        );
      }
      return payload.data;
    } catch (error) {
      lastError = error;
      // 4xx 与业务错误不重试；5xx / 网络错误最多重试 2 次
      if (error instanceof ApiClientError && error.status < 500) {
        throw error;
      }
      if (attempt === retries) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }

  if (lastError instanceof ApiClientError) {
    throw lastError;
  }
  throw new ApiClientError(-1, toFriendlyMessage(-1, '', 0), 0);
}

export const httpClient = {
  get<T>(path: string, params?: RequestOptions['params'], signal?: AbortSignal) {
    return request<T>(path, { params, signal, init: { method: 'GET' } });
  },
};
