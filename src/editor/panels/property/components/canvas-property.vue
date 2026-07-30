<script setup lang="ts">
import type { DefineSetter } from '@/materials';
import { useEditorStore } from '@/stores/editor';
import FormCreater from './form-creater.vue';
import type { ComputedDeepKeys } from '@/types';

defineOptions({
  name: 'CanvasProperty',
});

const editorStore = useEditorStore();

type SetterKeys = `canvas.${ComputedDeepKeys<typeof editorStore.canvas>}` | 'page.name';

const setters: DefineSetter<SetterKeys>[] = [
  { key: 'page.name', label: '画布名称', type: 'input' },
  { key: 'canvas.width', label: '宽度', type: 'number' },
  { key: 'canvas.height', label: '高度', type: 'number' },
  { key: 'canvas.backgroundColor', label: '背景色', type: 'color' },
];
</script>

<template>
  <div>
    <FormCreater :setters="setters" :form-data="editorStore" />
  </div>
</template>
