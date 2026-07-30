<script setup lang="ts">
import { debounce } from '@/utils';
import { init, type EChartsType } from 'echarts';
defineOptions({
  name: 'ChartMaterial',
});

const props = defineProps<{
  option: Record<string, any>;
}>();

const chartRef = useTemplateRef('chartRef');
let chart: EChartsType | null = null;

onMounted(() => {
  if (!chartRef.value) return;

  const _chart = init(chartRef.value);
  chart = _chart;
  _chart.setOption(props.option);

  const ob = new ResizeObserver(debounce(() => _chart.resize(), 120));

  ob.observe(chartRef.value);

  onUnmounted(() => {
    ob.disconnect();
    _chart.dispose();
    chart = null;
  });
});

watch(
  () => props.option,
  () => {
    chart?.setOption(props.option);
  },
  { deep: true },
);
</script>

<template>
  <div ref="chartRef"></div>
</template>
