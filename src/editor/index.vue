<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts';
import ToolbarLeft from './toolbar/toolbar-left.vue';
import ToolbarRight from './toolbar/toolbar-right.vue';
import MaterialPanel from './panels/material/index.vue';
import LayerPanel from './panels/layer/index.vue';
import CanvasRoot from './canvas/index.vue';
import PropertyPanel from './panels/property/index.vue';
import { useRoute, useRouter } from 'vue-router';
import { getPublishedScreen } from '@/utils/publish.ts';
import { storeToRefs } from 'pinia';

defineOptions({
  name: 'ScreenEditor',
});

const editorStore = useEditorStore();
const { page, panelVisible } = storeToRefs(editorStore);
const router = useRouter();
const route = useRoute();

onMounted(async () => {
  const pageId = route.query.id as string;
  if (pageId) {
    const publishedScreen = await getPublishedScreen(pageId);
    if (!publishedScreen) {
      console.error('画布不存在');
      ElMessage.error({
        message: '画布不存在, 创建新画布',
        onClose() {
          router.replace('/editor');
        },
      });
      return;
    }
    editorStore.initPage(publishedScreen);
  }
});
</script>

<template>
  <div class="h-screen flex flex-col bg-bg select-none">
    <header
      class="relative flex-[0_0_auto] w-full h-56 border-border border-b flex items-center justify-between px-16"
    >
      <ToolbarLeft />
      <div class="absolute left-1/2 top-1/2 -translate-1/2">{{ page.name }}</div>
      <ToolbarRight />
    </header>
    <main
      class="editor-main flex-1 flex overflow-hidden"
      :class="[
        [
          '[&>aside]:border-border',
          '[&>aside]:border-solid',
          '[&>aside]:overflow-hidden',
          '[&>aside]:flex-[0_0_auto]',
        ],
        // 折叠态及过渡
        ['[&>aside]:transition-all', '[&>.w-0]:border-0'],
      ]"
    >
      <!-- 物料 -->
      <aside class="border-r" :class="[panelVisible.material ? 'w-256' : 'w-0']">
        <MaterialPanel />
      </aside>
      <!-- 图层 -->
      <aside class="border-r" :class="[panelVisible.layer ? 'w-156' : 'w-0']">
        <LayerPanel />
      </aside>
      <!-- 画布 -->
      <div class="canvas flex-1 overflow-hidden">
        <CanvasRoot />
      </div>
      <!-- 属性 -->
      <aside class="border-l" :class="[panelVisible.property ? 'w-400' : 'w-0']">
        <PropertyPanel />
      </aside>
    </main>
  </div>
</template>
