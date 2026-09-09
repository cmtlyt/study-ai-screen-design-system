<script setup lang="ts">
defineOptions({
  name: 'TextMaterial',
});
defineProps<{ content: string }>();
</script>

<template>
  <span>{{ content }}</span>
</template>
