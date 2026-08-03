<script setup lang="ts">
import { useUndoRedo } from '@/composables/use-undo-redo';
import type { Setter } from '@/materials';
import type { DataSourceSchema } from '@/schema/types';
import { useEditorStore } from '@/stores/editor';
import { deepClone } from '@/utils';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'DataSourceManager',
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const editorStore = useEditorStore();
const { dataSource } = storeToRefs(editorStore);

const dataSourceBuffer = ref(deepClone(dataSource.value));
const activeDataSource = ref<DataSourceSchema>();

function selecteDataSource(item: DataSourceSchema) {
  rollbackItem();
  activeDataSource.value = item;
}

const dataSourceSetter = computed(() => {
  if (!activeDataSource.value) return [];
  const setter: Setter[] = [
    { key: 'id', label: 'ID', type: 'input', props: { disabled: true } },
    { key: 'name', label: '名称', type: 'input' },
    {
      key: 'type',
      label: '类型',
      type: 'radio',
      props: {
        type: 'button',
        options: [
          { label: '静态数据', value: 'static' },
          { label: '接口', value: 'api' },
        ],
      },
    },
  ];
  const isApi = activeDataSource.value.type === 'api';
  if (isApi) {
    setter.push(
      ...([
        { key: 'url', label: '接口地址', type: 'input' },
        { key: 'interval', label: '轮询间隔', type: 'number' },
        { key: 'params', label: '接口参数', type: 'input' },
      ] satisfies Setter[]),
    );
  }
  setter.push({
    key: 'data',
    label: `${isApi ? '兜底' : ''}数据`,
    type: 'codeEditor',
    props: {
      style: { height: '500px' },
      encoder: (value: any) => JSON.stringify(value, null, 2),
      decoder: (value: string) => JSON.parse(value),
    },
  });
  return setter;
});

function rollbackItem() {
  if (!activeDataSource.value?.id) return;

  const index = dataSourceBuffer.value.findIndex((item) => item.id === activeDataSource.value!.id);
  if (!~index) return;

  const savedData = dataSource.value[index];
  if (!savedData) {
    // 新增但未保存的数据源，取消时直接移除
    dataSourceBuffer.value.splice(index, 1);
    activeDataSource.value = undefined;
    return;
  }

  const oldData = deepClone(savedData);
  dataSourceBuffer.value.splice(index, 1, oldData);
  activeDataSource.value = oldData;
}

function onClose() {
  emit('close');
}

const { applyChange } = useUndoRedo();

function onSave() {
  applyChange(dataSource, 'value', deepClone(dataSourceBuffer.value));
}

function onAdd() {
  dataSourceBuffer.value.push({
    id: `ds_${Date.now()}`,
    name: '未命名',
    type: 'static',
    data: undefined,
  });
  selecteDataSource(dataSourceBuffer.value.at(-1)!);
}

function removeDataSource(id: string) {
  const index = dataSourceBuffer.value.findIndex((item) => item.id === id);
  if (!~index) return;
  dataSourceBuffer.value.splice(index, 1);
  if (id === activeDataSource.value?.id) activeDataSource.value = undefined;
}
</script>

<template>
  <div class="flex h-[70vh] overflow-hidden gap-8 border-border border-t">
    <aside
      :class="[
        ['flex-[0_0_auto]', 'flex', 'flex-col', 'items-center', 'justify-start'],
        ['w-[30%]', 'p-8', 'gap-8', 'pl-0'],
        ['border-border', 'border-r', 'overflow-x-hidden', 'overflow-y-auto'],
        ['[&>.active]:border-primary', '[&>.active]:bg-primary'],
      ]"
    >
      <div
        class="sticky top-0 flex justify-end w-full flex-[0_0_auto] bg-(--el-dialog-bg-color) shadow-[0_-8rem_0_0_var(--el-dialog-bg-color)]"
      >
        <el-button type="text" @click="onAdd">新增数据源</el-button>
      </div>
      <div
        v-for="item in dataSourceBuffer"
        :key="item.id"
        class="h-40 w-full flex-[0_0_auto] flex items-center justify-between border-border border rounded-[8rem] px-8 transition-all"
        :class="{ active: item.id === activeDataSource?.id }"
        @click="selecteDataSource(item)"
      >
        <span>{{ item.name }}</span>
        <vue-icon
          class="hover:text-red-400 transition-colors"
          icon="mingcute:close-fill"
          @click.stop="removeDataSource(item.id)"
        />
      </div>
    </aside>
    <main class="flex-1 p-8 overflow-x-hidden overflow-y-auto flex flex-col">
      <div class="flex-1">
        <form-creater
          v-if="activeDataSource"
          :setters="dataSourceSetter"
          :form-data="activeDataSource"
          ignore-history
        />
      </div>
      <div class="flex-[0_0_auto] flex justify-end">
        <el-button @click="onClose">关闭</el-button>
        <el-button type="primary" @click="onSave">保存</el-button>
      </div>
    </main>
  </div>
</template>
