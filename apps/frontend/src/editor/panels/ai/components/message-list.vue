<script lang="ts">
export interface Message {
  id: string;
  type: string;
  text: string;
}
</script>

<script lang="ts" setup>
defineOptions({
  name: 'MessageList',
});

defineProps<{
  messages: Array<Message>;
}>();
</script>

<template>
  <div class="flex flex-col gap-12 p-12 overflow-y-auto scrollbar-none">
    <div
      v-for="message in messages"
      :key="message.id"
      class="flex items-start gap-8 max-w-[80%]"
      :class="[message.type === 'human' ? 'self-end flex-row-reverse' : '']"
    >
      <el-avatar class="flex-[0_0_auto]" :size="32">
        {{ message.type === 'human' ? '我' : 'AI' }}
      </el-avatar>
      <span
        class="py-8 px-12 rounded-[12px]"
        :class="[
          message.type === 'human'
            ? 'rounded-tr-[4px] bg-blue-500'
            : 'rounded-tl-[4px] bg-gray-600',
        ]"
      >
        {{ message.text }}
      </span>
    </div>
  </div>
</template>
