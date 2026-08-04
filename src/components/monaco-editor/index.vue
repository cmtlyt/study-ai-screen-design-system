<script setup lang="ts">
import * as monaco from 'monaco-editor';
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
    lazy?: boolean;
    encoder?: (value: any) => string;
    decoder?: (value: string) => any;
    hooks?: {
      onCreateInstanceBefore?: (_monaco: typeof monaco) => Promise<void> | void;
      onUnmounted?: (
        _monaco: typeof monaco,
        editor: monaco.editor.IStandaloneCodeEditor,
      ) => Promise<void> | void;
    };
  }>(),
  {
    lang: 'json',
    readonly: false,
    disableWatch: false,
    lazy: false,
    encoder: (v: any) => v,
    //! 不允许设置 decoder 的默认值, 因为 lazy change 是否启用依赖 decoder 是否存在
    decoder: undefined,
  },
);

const hooks = toRef(props, 'hooks');

const emit = defineEmits<{
  (e: 'focus'): void;
  (e: 'blur'): void;
}>();

const modelValue = defineModel<any>({ default: '' });

const editorRef = useTemplateRef('editorRef');

let unmountedHandler: () => Promise<void> = async () => {};

function getFileExt(lang: string) {
  switch (lang) {
    case 'json':
      return 'json';
    case 'javascript':
    case 'js':
      return 'js';
    case 'typescript':
    case 'ts':
      return 'ts';
    default:
      return 'json';
  }
}

async function init() {
  if (!editorRef.value) return;

  let changed = false;
  const { editor } = monaco;

  await hooks.value?.onCreateInstanceBefore?.(monaco);

  const model = editor.createModel(
    props.encoder(modelValue.value),
    props.lang,
    monaco.Uri.parse(`file:///workspace/temp-${Date.now()}.${getFileExt(props.lang)}`),
  );

  const instance = editor.create(editorRef.value, {
    theme: 'vs-dark',
    tabSize: 2,
    // 自适应宽高
    automaticLayout: true,
    model,
    readOnly: props.readonly,
  });

  const contentChangeDisposable = instance.onDidChangeModelContent(() => {
    if (!(props.decoder || props.lazy)) {
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
      if (props.decoder || props.lazy) {
        const data = props.decoder?.(content) || content;
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

  unmountedHandler = async () => {
    await hooks.value?.onUnmounted?.(monaco, instance);
    contentChangeDisposable.dispose();
    focusDisposable.dispose();
    blurDisposable.dispose();
    instance.dispose();
    // editor.dispose() 不会销毁 model, 需手动 dispose 避免 model 泄露
    model.dispose();
  };
}

onMounted(init);
onUnmounted(async () => unmountedHandler());

defineExpose({
  reLoad: async () => {
    await unmountedHandler();
    await init();
  },
});
</script>

<template>
  <div class="size-full" ref="editorRef"></div>
</template>