<script setup lang="ts">
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
    @mousedown="emit('select', $event, node)"
  />
</template>
