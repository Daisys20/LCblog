import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiClientError } from '../api/client';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: string | undefined;
}

/**
 * 统一的异步数据加载：自动取消上一次请求、提供重试能力。
 */
export function useAsync<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: undefined,
    loading: true,
    error: undefined,
  });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({ data, loading: false, error: undefined });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error as Error)?.name === 'AbortError') {
          return;
        }
        const message =
          error instanceof ApiClientError ? error.message : '加载失败，请稍后再试';
        setState({ data: undefined, loading: false, error: message });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  return { ...state, reload };
}
