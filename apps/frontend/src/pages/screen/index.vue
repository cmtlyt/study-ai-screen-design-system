<script setup lang="ts">
import { useTitle } from '@cmtlyt/lingshu-toolkit/vue/use-title';
import { getPublishedScreen } from '@/utils';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'PublishedScreen',
});

const route = useRoute();
const { id } = route.query;

const page = ref();

useTitle(() => page.value?.name, { restoreOnUnmount: true });

onMounted(async () => {
  const publishedScreen = await getPublishedScreen(id as string);
  page.value = publishedScreen;
});
</script>

<template>
  <screen-render v-if="page" :page="page" />
</template>
