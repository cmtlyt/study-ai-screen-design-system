<script setup lang="ts">
defineOptions({
  name: 'TextMaterial',
});
defineProps<{ content: string; size: number }>();
</script>

<template>
  <span :style="{ fontSize: `${size}px` }">{{ content }}</span>
</template>
