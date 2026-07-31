import { DATA_SOURCE_KEY } from '@/constants/provider-key';
import { createApi, defineApi } from '@cmtlyt/lingshu-toolkit';

const pageSearch = new URLSearchParams(location.search).toString();

const loadDataApi = createApi(
  defineApi({
    url: '/',
    method: 'GET',
    onRequest(req, config) {
      // 请求转发逻辑
      const { url, ...otherData } = config.data || {};
      if (url) {
        const newUrl = new URL(config.data.url, config.baseUrl);
        const requestSearch = new URLSearchParams(otherData).toString();
        newUrl.search = `${requestSearch}&${pageSearch}`;
        // 启用的话删除 console 放开 return 就好了
        console.debug('request forward', new Request(newUrl, req));
        // return new Request(newUrl, req);
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
  }),
  { baseUrl: '/' },
);

export function useDataSource(dataId: Ref<string | undefined>) {
  const dataSource = inject(DATA_SOURCE_KEY)!;

  const source = computed(
    () => (dataId.value && dataSource.value.find((item) => item.id === dataId.value)) || undefined,
  );

  const data = ref();

  let timer: number;

  const loadData = async () => {
    if (!source.value) return;
    if (source.value.type === 'api') {
      const { url, interval, data: fullbackData, params } = source.value;
      return loadDataApi({ url, ...params }).then(
        (res: any) => {
          data.value = res;
          if (interval) timer = setTimeout(loadData, interval);
        },
        () => {
          data.value = fullbackData;
        },
      );
    } else {
      data.value = source.value.data;
    }
  };

  watch(source, loadData, { immediate: true });

  onBeforeUnmount(() => {
    clearTimeout(timer);
  });

  return { data };
}
