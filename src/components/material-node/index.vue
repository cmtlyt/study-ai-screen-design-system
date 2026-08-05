<script setup lang="ts">
import { RUNTIME_UTILS_KEY, RUNTIME_CONTEXT_KEY, RUNTIME_SANDBOX } from '@/constants/provider-key';
import { getMaterialComponent } from '@/materials';
import { createDispatcher, createHandlerParams, createHandlers } from '@/runtime/context';
import type { MaterialSchema } from '@/schema/types';
import { getNodeStyle } from '@/utils';

defineOptions({
  name: 'MaterialNode',
});

const emit = defineEmits<{
  (event: 'select', $event: MouseEvent, node: MaterialSchema): void;
}>();

const props = defineProps<{
  node: MaterialSchema;
  index: number;
  editMode?: boolean;
}>();

const nodeRef = useTemplateRef('nodeRef');

function createEvents(node: MaterialSchema) {
  if (props.editMode) return {};

  const { events } = node;
  if (!events?.length) return {};

  const context = inject(RUNTIME_CONTEXT_KEY);
  const utils = inject(RUNTIME_UTILS_KEY)! || {};
  const { sandbox } = inject(RUNTIME_SANDBOX)! || {};
  if (!context) return {};

  return events.reduce(
    (prev, curr) => {
      const handlerContext = createHandlerParams(node, utils);
      const dispatcher = createDispatcher(context, utils);
      const { eventHandler, handler } = createHandlers({
        event: curr,
        context: handlerContext,
        sandbox,
        dispatcher,
      });
      prev[curr.type] = eventHandler;
      curr.handler = handler;
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
