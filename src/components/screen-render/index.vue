<script setup lang="ts">
import { useCanvasStyle } from '@/composables/use-canvas-style';
import { DATA_SOURCE_KEY, RUNTIME_CONTEXT_KEY, STAGE_SCALE_KEY } from '@/constants/provider-key';
import { createRuntimeContext } from '@/runtime/context';
import type { PageSchema } from '@/schema/types';
import { debounce, getDeepProp } from '@/utils';

defineOptions({
  name: 'ScreenPender',
});

const props = defineProps<{
  page: PageSchema;
}>();

const runtimePage = ref(props.page);

const canvas = computed(() => runtimePage.value.canvas);
const nodes = computed(() => runtimePage.value.nodes);
const dataSource = computed(() => runtimePage.value.dataSource);

const context = createRuntimeContext(runtimePage);

// @ts-expect-error window is global
window.$context = context;

provide(RUNTIME_CONTEXT_KEY, context);

provide(DATA_SOURCE_KEY, dataSource);

const canvasStyle = useCanvasStyle(canvas);

const stageScale = ref(0);

provide(STAGE_SCALE_KEY, stageScale);

const vm = getCurrentInstance();

onMounted(() => {
  const patchScale = () => {
    const scaleX = window.innerWidth / canvas.value.width;
    const scaleY = window.innerHeight / canvas.value.height;
    stageScale.value = Math.min(scaleX, scaleY);
  };

  patchScale();

  if (!vm?.proxy?.$el) return;

  const ob = new ResizeObserver(debounce(patchScale, 120));

  ob.observe(vm.proxy.$el);

  return () => {
    ob.disconnect();
  };
});

onMounted(() => {
  if (!vm) return;

  Object.entries(vm.refs).forEach(([key, value]) => {
    context.registerNodeInstance(key, getDeepProp(value as any, '0.nodeRef'));
  });
});
</script>

<template>
  <div
    class="relative w-screen h-screen overflow-hidden"
    :style="{ backgroundColor: canvasStyle.backgroundColor }"
  >
    <div
      class="absolute origin-top-left top-1/2 left-1/2"
      :style="{ ...canvasStyle, transform: `scale(${stageScale}) translate(-50%, -50%)` }"
    >
      <material-node
        v-for="(node, index) in nodes"
        :key="node.id"
        :ref="node.id"
        :node="node"
        :index="index"
      />
    </div>
  </div>
</template>
