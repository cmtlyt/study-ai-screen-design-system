<script lang="ts" setup>
import MessageList from './components/message-list.vue';
import { useStream } from '@langchain/vue';
import type { AgentInputState, AgentState } from '@ai-screen-design-system/agent-server/types';
import { ACTION_TYPES } from '@ai-screen-design-system/agent-server';
import { getThreadId, setThreadId, deleteThreadId } from './thread-storage';
import { storeToRefs } from 'pinia';
import { useEditorStore } from '@/stores/editor';
import { getAllMaterialSchema } from '@/materials/index';
import { canvasSchema, dataSourceSchema } from '@/schema/types/page';
import { toJSONSchema } from '@/utils/agent-schema';

defineOptions({
  name: 'AiPanel',
});

const editorStore = useEditorStore();
const { page, selectedNodeIds } = storeToRefs(editorStore);
const runId = ref<string | null>(null);

const { client, messages, isLoading, values, submit, stop } = useStream<AgentInputState>({
  apiUrl: 'http://localhost:2024',
  assistantId: 'agent',
  transport: 'sse',
  threadId: getThreadId(),
  onThreadId: setThreadId,
  onCreated: (info) => {
    runId.value = info.runId;
  },
});

watch(
  () => (values.value as AgentState)?.actions,
  (actions) => {
    if (!actions?.length) return;
    actions.forEach((action) => {
      if (action.type === ACTION_TYPES.addNode && action.data) {
        editorStore.addNode(action.data as any);
        return;
      }
      if (action.type === ACTION_TYPES.updateNode && action.data?.id) {
        editorStore.updateNode(action.data.id as string, action.data as any);
        return;
      }
      if (action.type === ACTION_TYPES.removeNode && action.data) {
        editorStore.removeNode(action.data as any);
        return;
      }
      if (action.type === ACTION_TYPES.addDataSource && action.data) {
        editorStore.addDataSource(action.data as any);
        return;
      }
      if (action.type === ACTION_TYPES.updateDataSource && action.data?.id) {
        editorStore.updateDataSource(action.data.id as string, action.data as any);
        return;
      }
    });
  },
);

const content = ref('');

function onSubmit() {
  const value = content.value.trim();
  if (isLoading.value || !value) return;
  submit({
    messages: [{ type: 'human', content: value }],
    page: page.value,
    selectedNodeIds: selectedNodeIds.value,
    schema: {
      material: getAllMaterialSchema(),
      canvas: toJSONSchema(canvasSchema),
      dataSource: toJSONSchema(dataSourceSchema),
    },
  });
  content.value = '';
}

function onKeydown(_event: KeyboardEvent | Event) {
  const event = _event as KeyboardEvent;
  if (event.shiftKey || event.isComposing) return;
  event.preventDefault();
  event.stopPropagation();
  onSubmit();
}

async function onCancel() {
  await client.runs.cancel(getThreadId()!, runId.value!, true, 'rollback');
  stop();
}

async function onDelete() {
  const threadId = getThreadId();
  if (!threadId) return;
  await client.threads.delete(threadId);
  deleteThreadId();
  location.reload();
}
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <MessageList class="flex-1" :messages="messages" :loading="isLoading" />
    <footer class="flex flex-col gap-8 p-12 border-t border-border">
      <el-input
        type="textarea"
        :rows="4"
        v-model="content"
        resize="none"
        @keydown.enter="onKeydown"
      ></el-input>
      <div class="flex items-center justify-between">
        <div>
          <vue-icon
            icon="fluent:delete-12-filled"
            class="transition-colors hover:text-red-500"
            @click="onDelete"
          />
        </div>
        <div>
          <el-button v-if="isLoading" type="danger" @click="onCancel">取消</el-button>
          <el-button v-else type="primary" @click="onSubmit">发送</el-button>
        </div>
      </div>
    </footer>
  </div>
</template>
