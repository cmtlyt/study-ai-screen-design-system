import { DATA_SOURCE_KEY } from '@/constants/provider-key';
import type { DataSourceSchema } from '@/schema/types';
import { getDeepProp } from '@/utils';
import { createApi, defineApi } from '@cmtlyt/lingshu-toolkit';

const API_CONFIG = Symbol('API_CONFIG');

const pageSearch = new URLSearchParams(location.search);
const pageSearchString = pageSearch.toString();
const pageSearchObj = Object.fromEntries(pageSearch);

const loadDataApi = createApi(
  defineApi({
    url: '/',
    onRequest(req, config) {
      // 请求转发逻辑
      const { [API_CONFIG]: apiConfig, ...otherData } = config.data || {};
      const isGetRequest = apiConfig.method === 'GET';
      if (apiConfig.url) {
        const newUrl = new URL(apiConfig.url, config.baseUrl);
        if (isGetRequest) {
          const requestSearch = new URLSearchParams(otherData).toString();
          newUrl.search = `${pageSearchString}&${requestSearch}`;
        }
        const newRequest = new Request(newUrl, {
          ...req,
          method: apiConfig.method || req.method,
          body: isGetRequest ? undefined : JSON.stringify({ ...pageSearchObj, ...otherData }),
        });
        // 启用的话删除 console 放开 return 就好了
        console.debug('request forward debug', newRequest);
        // return newRequest;
      }
      // mock
      const data = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'].map(
        (item, index) => {
          return {
            label: `${item}月`,
            value: Math.floor(Math.random() * 1000 + index) * (index + 1),
          };
        },
      );
      return new Response(JSON.stringify(data));
    },
    async onResponse(res, config) {
      const { [API_CONFIG]: apiConfig } = config.data || {};
      const { readPath } = apiConfig;
      const data = await res.json();
      const parsedData = getDeepProp(data, readPath);
      return parsedData;
    },
  }),
  { baseUrl: '/' },
);

const requestCache = new Map<string, Promise<any>>();

export function useDataSource(dataId: Ref<string | undefined>) {
  const dataSource = inject(DATA_SOURCE_KEY)!;

  const source = computed(
    () => (dataId.value && dataSource.value.find((item) => item.id === dataId.value)) || undefined,
  );

  const data = ref();
  const loading = ref(false);
  const error = ref();

  let timer: number;

  const loadData = async (uParams?: Record<string, any>) => {
    if (!source.value) return;
    if (source.value.type === 'api') {
      const { interval, data: fullbackData, params, ...config } = source.value;
      const sourceId = source.value.id;

      loading.value = true;

      const request =
        requestCache.get(sourceId) ||
        loadDataApi({ [API_CONFIG]: config, ...params, ...uParams }).finally(() => {
          requestCache.delete(sourceId);
        });

      requestCache.set(sourceId, request);

      return request
        .then(
          (res: any) => {
            data.value = res;
          },
          (err: any) => {
            if (!fullbackData) {
              error.value = err;
              return;
            }
            data.value = fullbackData;
            return fullbackData;
          },
        )
        .finally(() => {
          timer && clearTimeout(timer);
          if (interval) {
            timer = setTimeout(() => loadData(), interval);
          }
          loading.value = false;
        });
    } else {
      data.value = source.value.data;
    }
  };

  watch(source, () => loadData(), { immediate: true });

  onBeforeUnmount(() => {
    clearTimeout(timer);
  });

  return { data, loading, error, refresh: loadData };
}

export function previewData(dataSourceItem: DataSourceSchema) {
  if (dataSourceItem.type !== 'api') return dataSourceItem.data;
  const { params, data: fullbackData, ...config } = dataSourceItem;
  return loadDataApi({ [API_CONFIG]: config, ...params }).catch((error: any) => {
    if (!fullbackData) {
      throw error;
    }
    return fullbackData;
  });
}
