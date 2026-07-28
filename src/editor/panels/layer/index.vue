<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { useDraggable } from 'vue-draggable-plus';

defineOptions({
  name: 'LayerPanel',
});

const editorStore = useEditorStore();
const { nodes, selectedNodeIds } = storeToRefs(editorStore);

useDraggable('.layer-panel', nodes, { animation: 150, direction: 'horizontal' });
</script>

<template>
  <div class="h-full flex flex-col overflow-auto">
    <div
      class="layer-panel p-8 flex flex-col-reverse gap-8"
      :class="[['[&>.active]:bg-primary', '[&>.active]:border-primary']]"
    >
      <div
        v-for="node in nodes"
        :key="node.id"
        class="flex-[0_0_auto] h-30 px-8 border border-border flex items-center justify-between rounded-[4rem] cursor-pointer overflow-hidden bg-bg"
        :class="{ active: selectedNodeIds.includes(node.id) }"
        @click="editorStore.selectNode(node.id)"
      >
        <span class="flex-1 line-clamp-1">{{ node.name }}</span>
        <vue-icon icon="fluent:list-bar-20-filled" />
      </div>
    </div>
  </div>
</template>
