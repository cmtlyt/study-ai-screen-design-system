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
    readonly?: boolean;
    encoder?: (value: any) => string;
    decoder?: (value: string) => any;
  }>(),
  {
    lang: 'json',
  },
);

const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

type ModelType = typeof props.encoder extends (...args: any[]) => any ? any : string;

const modelValue = defineModel<ModelType>({ default: '' });

const editorRef = useTemplateRef('editorRef');

onMounted(() => {
  if (!editorRef.value) return;

  const instance = editor.create(editorRef.value, {
    theme: 'vs-dark',
    tabSize: 2,
    // 自适应宽高
    automaticLayout: true,
    value: props.encoder?.(modelValue.value) || modelValue.value,
    language: props.lang || 'json',
    readOnly: props.readonly,
  });

  const contentChangeDisposable = instance.onDidChangeModelContent(() => {
    if (!props.decoder) {
      const content = instance.getValue();
      modelValue.value = content;
    }
  });

  const focusDisposable = instance.onDidFocusEditorText(() => {
    emit('focus');
  });

  const blurDisposable = instance.onDidBlurEditorText(() => {
    if (props.decoder) {
      const content = props.decoder(instance.getValue());
      modelValue.value = content;
    }
    emit('blur');
  });

  const modelValueChangeDisposable = watch(modelValue, () => {
    instance.setValue(props.encoder?.(modelValue.value) || modelValue.value);
  });

  onUnmounted(() => {
    modelValueChangeDisposable.stop();
    contentChangeDisposable.dispose();
    focusDisposable.dispose();
    blurDisposable.dispose();
    instance.dispose();
  });
});
</script>

<template>
  <div class="size-full" ref="editorRef"></div>
</template>
