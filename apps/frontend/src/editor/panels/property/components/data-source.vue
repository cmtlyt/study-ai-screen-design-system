<script setup lang="ts">
import type { Setter } from '@/materials';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import FormCreater from './form-creater.vue';

defineOptions({
  name: 'DataSource',
});

const editorStore = useEditorStore();
const { dataSource, selectedNode } = storeToRefs(editorStore);

const dataSourceSetter: Setter[] = [
  {
    key: 'props.dataId',
    label: '数据源',
    type: 'select',
    props: {
      placeholder: '请选择数据源',
      options: dataSource.value.map((item) => ({ label: item.name, value: item.id })),
    },
  },
];
</script>

<template>
  <div>
    <FormCreater :setters="dataSourceSetter" :form-data="selectedNode!" />
  </div>
</template>
