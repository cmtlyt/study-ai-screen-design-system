<script setup lang="ts">
import { useUndoRedo } from '@/composables/use-undo-redo';
import type { Setter } from '@/materials';
import type { MaterialEvent } from '@/schema/types';
import { useEditorStore } from '@/stores/editor';
import { deepClone } from '@/utils';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'NodeEvents',
});

const emit = defineEmits<{
  (event: 'close'): void;
}>();

const editorStore = useEditorStore();
const { selectedNode } = storeToRefs(editorStore);

const eventsBuffer = ref(deepClone(selectedNode.value?.events || []));
const activeEvent = ref<MaterialEvent>();

const filterText = ref('');

const filteredEvents = computed(() => {
  if (!filterText.value) return eventsBuffer.value;
  return eventsBuffer.value.filter((item) => item.name.includes(filterText.value));
});

function selecteEvent(item: MaterialEvent) {
  rollbackItem();
  activeEvent.value = item;
}

const eventsSetter = computed(() => {
  if (!activeEvent.value) return [];
  const setter: Setter[] = [
    { key: 'name', label: '名称', type: 'input' },
    { key: 'desc', label: '事件描述', type: 'input' },
    {
      key: 'type',
      label: '类型',
      type: 'select',
      props: {
        options: [
          { label: '点击', value: 'click' },
          { label: '自定义', value: 'custom' },
        ],
      },
      'x-onChange': (value: string, formData: MaterialEvent) => {
        if (value === 'click') {
          formData.code = `function main($context, $node, $event) {\n}`;
        } else if (value === 'custom') {
          formData.code = 'function main($context, $node, ...args) {\n}';
        }
      },
    },
    {
      key: 'code',
      label: '代码',
      type: 'codeEditor',
      props: { style: { height: '500px' }, decoder: (v: any) => v, lang: 'javascript' },
    },
  ];
  return setter;
});

function rollbackItem() {
  if (!activeEvent.value) return;

  const index = eventsBuffer.value.findIndex((item) => item.name === activeEvent.value?.name);
  if (!~index || !selectedNode.value) return;

  const savedData = selectedNode.value.events?.[index];
  if (!savedData) {
    // 新增但未保存的数据源，取消时直接移除
    eventsBuffer.value.splice(index, 1);
    activeEvent.value = undefined;
    return;
  }

  const oldData = deepClone(savedData);
  eventsBuffer.value.splice(index, 1, oldData);
  activeEvent.value = oldData;
}

function onClose() {
  emit('close');
}

const { applyChange } = useUndoRedo();

function onSave() {
  if (!selectedNode.value) return;
  applyChange(selectedNode.value, 'events', deepClone(eventsBuffer.value));
}

function onAdd() {
  eventsBuffer.value.push({
    name: `fn_${Date.now()}`,
    type: 'click',
    code: 'function main(event, $context, $node) {\n}',
  });
  selecteEvent(eventsBuffer.value.at(-1)!);
}

function removeEvent(eventName: string) {
  if (!eventName) return;
  const index = eventsBuffer.value.findIndex((item) => item.name === eventName);
  if (!~index) return;
  eventsBuffer.value.splice(index, 1);
  if (eventName === activeEvent.value?.name) activeEvent.value = undefined;
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
        class="sticky top-0 flex justify-between gap-8 w-full flex-[0_0_auto] bg-(--el-dialog-bg-color) shadow-[0_-8rem_0_0_var(--el-dialog-bg-color)]"
      >
        <el-input v-model="filterText" type="search" placeholder="输入事件名称" />
        <el-button type="text" @click="onAdd">新增</el-button>
      </div>
      <div
        v-for="item in filteredEvents"
        :key="item.name"
        class="w-full flex-[0_0_auto] flex items-center justify-between border-border border rounded-[8rem] px-8 py-8 gap-8 transition-all"
        :class="{ active: item.name === activeEvent?.name }"
        @click="selecteEvent(item)"
      >
        <div class="flex flex-col">
          <span>{{ item.name }}</span>
          <span class="line-clamp-1">{{ item.desc }}</span>
        </div>
        <vue-icon
          class="hover:text-red-400 transition-colors flex-[0_0_auto]"
          icon="mingcute:close-fill"
          @click.stop="removeEvent(item.name)"
        />
      </div>
    </aside>
    <main class="flex-1 p-8 overflow-hidden flex flex-col">
      <div class="flex-1 overflow-y-auto">
        <form-creater
          v-if="activeEvent"
          :setters="eventsSetter"
          :form-data="activeEvent"
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
