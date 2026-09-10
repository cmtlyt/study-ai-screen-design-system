<script lang="ts" setup>
import MessageList, { type Message } from './components/message-list.vue';

defineOptions({
  name: 'AiPanel',
});

const content = ref('');

const messages = ref<Message[]>(
  [
    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },

    { id: '0', type: 'human', text: '你好, 你是什么模型?' },
    { id: '1', type: 'ai', text: '你好啊, 我是xxx模型, 你有什么需要帮助的地方吗?' },
  ].map((item, index) => {
    item.id = String(index);
    return item;
  }),
);
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <MessageList class="flex-1" :messages="messages" />
    <footer class="flex flex-col gap-8 p-12 border-t border-border">
      <el-input type="textarea" :rows="4" v-model="content" resize="none"></el-input>
      <el-button type="primary">发送</el-button>
    </footer>
  </div>
</template>
