<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts';
import CanvasProperty from './components/canvas-property.vue';
import NodeProperty from './components/node-property.vue';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'PropertyPanel',
});

const editorStore = useEditorStore();
const { selectedNodeId } = storeToRefs(editorStore);
</script>

<template>
  <div class="p-8">
    <NodeProperty v-if="selectedNodeId" />
    <CanvasProperty v-else />
  </div>
</template>
