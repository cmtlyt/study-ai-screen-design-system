<script setup lang="ts">
import type { DefineSetter } from '@/materials';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import FormCreater from './form-creater.vue';

defineOptions({
  name: 'CanvasProperty',
});

const editorStore = useEditorStore();
const { canvas } = storeToRefs(editorStore);

const setters: DefineSetter<keyof typeof canvas.value>[] = [
  { key: 'width', label: '宽度', type: 'number' },
  { key: 'height', label: '高度', type: 'number' },
  { key: 'backgroundColor', label: '背景色', type: 'color' },
];
</script>

<template>
  <div>
    <FormCreater :setters="setters" :form-data="canvas" />
  </div>
</template>
