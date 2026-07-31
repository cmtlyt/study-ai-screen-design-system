import { DATA_SOURCE_KEY } from '@/constants/provider-key';

export function useDataSource(dataId: Ref<string | undefined>) {
  const dataSource = inject(DATA_SOURCE_KEY)!;

  const source = computed(
    () => (dataId.value && dataSource.value.find((item) => item.id === dataId.value)) || undefined,
  );

  const data = computed(() => source.value?.data);

  return { data };
}
