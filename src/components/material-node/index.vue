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
      prev[curr.type] = (event: Event) => {
        return Reflect.apply(
          new Function('event', '$context', '$node', `"use strict";return (${curr.code})`),
          null,
          [event, context, node],
        );
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
