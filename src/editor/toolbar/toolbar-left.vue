<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';

defineOptions({
  name: 'ToolbarLeft',
});

const { panelVisible } = useEditorStore();
</script>

<template>
  <div
    class="flex items-center gap-8"
    :class="[
      [
        '[&>span]:border',
        '[&>span]:rounded-[4px]',
        '[&>span]:border-border',
        '[&>span]:p-4',
        '[&>span]:cursor-pointer',
      ],
      // 激活态
      ['[&>.active]:bg-primary', '[&>.active]:border-primary'],
    ]"
  >
    <span v-trigger:material="panelVisible" :class="{ active: panelVisible.material }">
      <vue-icon icon="akar-icons:panel-left" />
    </span>
    <span v-trigger:property="panelVisible" :class="{ active: panelVisible.property }">
      <vue-icon icon="akar-icons:panel-right" />
    </span>
    <span v-trigger:layer="panelVisible" :class="{ active: panelVisible.layer }">
      <vue-icon icon="ci:layer" />
    </span>
    <span><vue-icon icon="ci:undo" /></span>
    <span><vue-icon icon="ci:redo" /></span>
  </div>
</template>
