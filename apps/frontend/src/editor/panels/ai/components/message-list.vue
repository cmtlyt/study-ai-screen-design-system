<script lang="ts">
export interface Message {
  id?: string;
  type: string;
  text: string;
}
</script>

<script lang="ts" setup>
import MarkdownRender from 'markstream-vue';
import 'markstream-vue/index.px.css';

defineOptions({
  name: 'MessageList',
});

const props = defineProps<{
  messages: Array<Message>;
  loading: boolean;
}>();

const messageContainer = useTemplateRef('message-container');
const messageList = useTemplateRef('message-list');

onMounted(() => {
  if (!messageContainer.value || !messageList.value) return;
  const mc = messageContainer.value;
  const ml = messageList.value;

  const mcRect = mc.getBoundingClientRect();
  const scrollCache = new WeakSet<HTMLElement>();

  const checkScroll = (dom?: HTMLElement | null) => {
    if (!props.loading) return false;
    if (!dom) return false;
    if (scrollCache.has(dom)) return false;

    const rect = dom.getBoundingClientRect();
    const allowScroll = mcRect.top <= rect.top;

    if (!allowScroll) {
      scrollCache.add(dom);
      dom.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }

    return allowScroll;
  };

  const resizeObserver = new ResizeObserver(() => {
    const lastChild = ml.children.item(ml.children.length - 1) as HTMLElement;
    if (!checkScroll(lastChild)) return;
    ml.scrollIntoView({ block: 'end', behavior: 'smooth' });
  });
  resizeObserver.observe(ml);
});
</script>

<template>
  <div ref="message-container" class="m-12 overflow-y-auto scrollbar-none">
    <div ref="message-list" class="flex flex-col gap-12">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex items-start gap-8 max-w-[85%]"
        :class="[message.type === 'human' ? 'self-end flex-row-reverse' : '']"
      >
        <el-avatar class="flex-[0_0_auto]" :size="32">
          {{ message.type === 'human' ? '我' : 'AI' }}
        </el-avatar>
        <div
          class="py-8 px-12 rounded-[12px]"
          :class="[
            message.type === 'human'
              ? 'rounded-tr-[4px] bg-blue-500'
              : 'rounded-tl-[4px] bg-gray-600',
          ]"
        >
          <MarkdownRender
            v-if="message.text"
            class="markdown"
            :render-code-blocks-as-pre="false"
            :code-block-props="{ showCopyButton: true }"
            :content="message.text"
            mode="chat"
            html-policy="escape"
            :final="true"
          />
          <span v-else>...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.markdown {
  --ms-flow-hr-y: 1em;

  :deep(:is(h1, h2, h3, h4, h5, h6, p)) {
    margin: 0;
  }
}
</style>
