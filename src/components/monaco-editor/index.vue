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
    disableWatch?: boolean;
    encoder?: (value: any) => string;
    decoder?: (value: string) => any;
  }>(),
  {
    lang: 'json',
    readonly: false,
    disableWatch: false,
    encoder: (v: any) => v,
    //! 不允许设置 decoder 的默认值, 因为 lazy change 是否启用依赖 decoder 是否存在
    decoder: undefined,
  },
);

const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

const modelValue = defineModel<any>({ default: '' });

const editorRef = useTemplateRef('editorRef');

onMounted(() => {
  if (!editorRef.value) return;

  let changed = false;

  const instance = editor.create(editorRef.value, {
    theme: 'vs-dark',
    tabSize: 2,
    // 自适应宽高
    automaticLayout: true,
    value: props.encoder(modelValue.value),
    language: props.lang || 'json',
    readOnly: props.readonly,
  });

  const contentChangeDisposable = instance.onDidChangeModelContent(() => {
    if (!props.decoder) {
      const content = instance.getValue();
      modelValue.value = content;
    }
    changed = true;
  });

  const focusDisposable = instance.onDidFocusEditorText(() => {
    emit('focus');
  });

  const blurDisposable = instance.onDidBlurEditorText(() => {
    const content = instance.getValue();
    if (changed) {
      if (props.decoder) {
        const data = props.decoder(content);
        modelValue.value = data;
      }
    }
    emit('blur');
  });

  if (!props.disableWatch) {
    watch(modelValue, (newValue) => {
      const content = props.encoder(newValue);
      instance.setValue(content);
      changed = false;
    });
  }

  onUnmounted(() => {
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
