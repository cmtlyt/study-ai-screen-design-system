<script setup lang="ts">
defineOptions({
  name: 'LayerPanel',
});
</script>

<template>
  <div
    class="layer-panel p-8 flex flex-col h-full gap-8 overflow-auto"
    :class="[['[&>.active]:bg-primary', '[&>.active]:border-primary']]"
  >
    <div
      v-for="_ in 100"
      :key="_"
      class="flex-[0_0_auto] h-30 px-8 border border-border flex items-center justify-between rounded-[4rem] cursor-pointer overflow-hidden"
      :class="{ active: _ === 1 }"
    >
      <span class="flex-1 line-clamp-1">柱状图</span>
      <vue-icon icon="fluent:list-bar-20-filled" />
    </div>
  </div>
</template>
