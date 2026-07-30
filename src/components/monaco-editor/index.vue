<script setup lang="ts">
import { editor } from 'monaco-editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/language/json/json.worker?worker';
import TsWorker from 'monaco-editor/language/typescript/ts.worker?worker';

window.MonacoEnvironment = {
  getWorker(workerId, label) {
    const params = { name: workerId };
    switch (label) {
      case 'json':
        return new JsonWorker(params);
      case 'javascript':
      case 'js':
      case 'typescript':
      case 'ts':
        return new TsWorker(params);
    }
    return new EditorWorker(params);
  },
};

defineOptions({
  name: 'MonacoEditor',
});

const props = withDefaults(
  defineProps<{
    lang?: string;
  }>(),
  {
    lang: 'json',
  },
);

const modelValue = defineModel<string>({ default: '' });

const editorRef = useTemplateRef('editorRef');

onMounted(() => {
  if (!editorRef.value) return;

  const instance = editor.create(editorRef.value, {
    theme: 'vs-dark',
    tabSize: 2,
    // 自适应宽高
    automaticLayout: true,
    value: modelValue.value,
    language: props.lang || 'json',
  });

  const contentChangeDisposable = instance.onDidChangeModelContent(() => {
    modelValue.value = instance.getValue();
  });

  onUnmounted(() => {
    contentChangeDisposable.dispose();
    instance.dispose();
  });
});
</script>

<template>
  <div class="size-full" ref="editorRef"></div>
</template>
