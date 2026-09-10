<script lang="ts" setup>
import MessageList from './components/message-list.vue';
import { useStream } from '@langchain/vue';
import type { AgentInputState } from '@ai-screen-design-system/agent-server/types';

defineOptions({
  name: 'AiPanel',
});

const content = ref('');

const { messages, isLoading, submit, stop } = useStream<AgentInputState>({
  apiUrl: 'http://localhost:2024',
  assistantId: 'agent',
  transport: 'sse',
});

function onSubmit() {
  const value = content.value.trim();
  if (isLoading.value || !value) return;
  submit({ messages: [{ type: 'human', content: value }] });
  content.value = '';
}

function onKeydown(_event: KeyboardEvent | Event) {
  const event = _event as KeyboardEvent;
  if (event.shiftKey || event.isComposing) return;
  event.preventDefault();
  event.stopPropagation();
  onSubmit();
}

function onCancel() {
  stop();
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
      <el-button v-if="isLoading" type="danger" @click="onCancel">取消</el-button>
      <el-button v-else type="primary" @click="onSubmit">发送</el-button>
    </footer>
  </div>
</template>
