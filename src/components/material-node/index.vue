<script setup lang="ts">
import { RUNTIME_CONTEXT_KEY } from '@/constants/provider-key';
import { getMaterialComponent } from '@/materials';
import type { MaterialSchema } from '@/schema/types';
import { getNodeStyle } from '@/utils';

defineOptions({
  name: 'MaterialNode',
});

const emit = defineEmits<{
  (event: 'select', $event: MouseEvent, node: MaterialSchema): void;
}>();

defineProps<{
  node: MaterialSchema;
  index: number;
}>();

const nodeRef = useTemplateRef('nodeRef');

function createEvents(node: MaterialSchema) {
  const { events } = node;
  if (!events?.length) return {};

  const context = inject(RUNTIME_CONTEXT_KEY);
  if (!context) return {};

  return events.reduce(
    (prev, curr) => {
      const handler = new Function(
        '$context',
        '$node',
        '...args',
        `${curr.code}\nreturn typeof main === 'function' ? main($context, $node, ...args) : undefined;`,
      );
      prev[curr.type] = (event: Event) => {
        return Reflect.apply(handler, null, [context, node, event]);
      };
      curr.handler = (...args) => {
        return Reflect.apply(handler, null, [context, node, ...args]);
      };
      return prev;
    },
    {} as Record<string, any>,
  );
}

defineExpose({
  nodeRef,
});
</script>

<template>
  <component
    ref="nodeRef"
    :is="getMaterialComponent(node.type)"
    v-bind="node.props"
    class="canvas-node"
    :style="getNodeStyle(node, index)"
    :data-node-id="node.id"
    :data-node-locked="node.locked"
    :schema="node"
    v-on="createEvents(node)"
    @mousedown="emit('select', $event, node)"
  />
</template>
