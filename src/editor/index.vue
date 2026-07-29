<script setup lang="ts">
import { useEditorStore } from '@/stores/editor.ts';
import ToolbarLeft from './toolbar/toolbar-left.vue';
import ToolbarRight from './toolbar/toolbar-right.vue';
import MaterialPanel from './panels/material/index.vue';
import LayerPanel from './panels/layer/index.vue';
import CanvasRoot from './canvas/index.vue';
import PropertyPanel from './panels/property/index.vue';

defineOptions({
  name: 'ScreenEditor',
});

const { panelVisible } = useEditorStore();
</script>

<template>
  <div class="editor h-screen flex flex-col bg-bg select-none">
    <header
      class="header flex-[0_0_auto] w-full h-56 border-border border-b flex items-center px-16"
    >
      <ToolbarLeft />
      <div class="flex-1"></div>
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
