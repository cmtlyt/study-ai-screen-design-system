<script setup lang="ts">
import {
  getMaterialCagetorys,
  getMaterialsByCagetory,
  type CagetoryKey,
} from '@/materials/index.ts';
import MaterialItem from './components/material-item.vue';

defineOptions({
  name: 'MaterialPanel',
});

const cagetorys = getMaterialCagetorys();

const activeCagetory = ref<CagetoryKey>('chart');

const currentMaterials = computed(() => {
  return getMaterialsByCagetory(activeCagetory.value);
});
</script>

<template>
  <div class="flex h-full">
    <div
      class="w-50 flex-[0_0_auto] border-border border-r flex gap-8 flex-col justify-start items-center pt-8"
      :class="[['[&>.active]:bg-primary', '[&>.active]:border-primary']]"
    >
      <div
        v-for="item in cagetorys"
        :key="item.key"
        class="f-center flex-col w-[80%] aspect-square rounded-[8rem] cursor-pointer border border-border transition-all text-[12rem]"
        :class="[{ active: activeCagetory === item.key }]"
        @click="activeCagetory = item.key"
      >
        <vue-icon :icon="item.icon" width="16" />
        <span>{{ item.name }}</span>
      </div>
    </div>
    <div class="flex-1 p-8 overflow-y-auto flex flex-col justify-start gap-8">
      <MaterialItem
        v-for="(material, index) in currentMaterials"
        :key="index"
        :material="material"
      />
    </div>
  </div>
</template>
