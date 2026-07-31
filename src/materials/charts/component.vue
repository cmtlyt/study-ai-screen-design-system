<script setup lang="ts">
import { debounce } from '@/utils';
import { init, type EChartsType } from 'echarts';
import { useDataSource } from '@/composables/use-data-source';

defineOptions({
  name: 'ChartMaterial',
});

const props = defineProps<{
  option: Record<string, any>;
  dataId?: string;
}>();

const chartRef = useTemplateRef('chartRef');
let chart: EChartsType | null = null;

const dataId = toRef(props, 'dataId');

const { data } = useDataSource(dataId);

const option = computed(() => ({
  ...props.option,
  dataset: {
    ...(props.option?.dataset as Record<never, any>),
    source: data.value || props.option?.dataset?.source,
  } satisfies { source?: any[] },
}));

onMounted(() => {
  if (!chartRef.value) return;

  const _chart = init(chartRef.value);
  chart = _chart;
  _chart.setOption(option.value);

  const ob = new ResizeObserver(debounce(() => _chart.resize(), 120));

  ob.observe(chartRef.value);

  onUnmounted(() => {
    ob.disconnect();
    _chart.dispose();
    chart = null;
  });
});

watch(option, () => chart?.setOption(option.value), { deep: true });
</script>

<template>
  <div ref="chartRef"></div>
</template>
