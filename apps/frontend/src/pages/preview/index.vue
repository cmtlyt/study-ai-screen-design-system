<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'ScreenPreview',
});

const editorStore = useEditorStore();
const { page } = storeToRefs(editorStore);
</script>

<template>
  <screen-render :page="page" />
</template>
