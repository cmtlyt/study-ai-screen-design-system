<script setup lang="ts">
import type { Material } from '@/materials';

defineOptions({
  name: 'MaterialItem',
});

const { material } = defineProps<{
  material: Material;
}>();

function onStart(event: DragEvent) {
  event.dataTransfer?.setData('schema', JSON.stringify(material.schema));
}
</script>

<template>
  <div
    class="h-140 p-10 flex flex-col border border-border rounded-[8rem] gap-8"
    :class="[
      ['transition-all'],
      ['hover:border-primary', 'hover:-translate-y-2', 'hover:shadow-md', 'hover:shadow-primary'],
    ]"
    draggable="true"
    @dragstart="onStart"
  >
    <div class="title h-max leading-none">{{ material.name }}</div>
    <div class="flex-1 border border-border rounded-[4rem] w-full f-center overflow-hidden">
      <vue-icon :icon="material.icon" height="100%" />
    </div>
  </div>
</template>
