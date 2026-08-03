<script setup lang="ts">
import { useCanvasStyle } from '@/composables/use-canvas-style';
import { DATA_SOURCE_KEY, STAGE_SCALE_KEY } from '@/constants/provider-key';
import type { PageSchema } from '@/schema/types';
import { debounce } from '@/utils';

defineOptions({
  name: 'ScreenPender',
});

const props = defineProps<{
  page: PageSchema;
}>();

const { canvas, nodes, dataSource } = toRefs(props.page);

provide(DATA_SOURCE_KEY, dataSource);

const canvasStyle = useCanvasStyle();

const containerRef = useTemplateRef('containerRef');

const stageScale = ref(0);

provide(STAGE_SCALE_KEY, stageScale);

onMounted(() => {
  const patchScale = () => {
    const scaleX = window.innerWidth / canvas.value.width;
    const scaleY = window.innerHeight / canvas.value.height;
    stageScale.value = Math.min(scaleX, scaleY);
  };

  patchScale();

  const ob = new ResizeObserver(debounce(patchScale, 120));

  ob.observe(containerRef.value!);

  return () => {
    ob.disconnect();
  };
});
</script>

<template>
  <div
    ref="containerRef"
    class="relative w-screen h-screen overflow-hidden"
    :style="{ backgroundColor: canvasStyle.backgroundColor }"
  >
    <div
      class="absolute origin-top-left top-1/2 left-1/2"
      :style="{ ...canvasStyle, transform: `scale(${stageScale}) translate(-50%, -50%)` }"
    >
      <material-node v-for="(node, index) in nodes" :key="node.id" :node="node" :index="index" />
    </div>
  </div>
</template>
