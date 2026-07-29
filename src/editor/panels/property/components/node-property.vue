<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { getMaterialSetters, type PositionLayoutLayoutSetters } from '@/materials';
import FormCreater from './form-creater.vue';

defineOptions({
  name: 'NodeProperty',
});

const editorStore = useEditorStore();
const { selectedNode } = storeToRefs(editorStore);

const layoutSetters: PositionLayoutLayoutSetters = [
  { key: 'layout.width', label: '宽度', type: 'number', span: 12 },
  { key: 'layout.height', label: '高度', type: 'number', span: 12 },
  { key: 'layout.x', label: 'X', type: 'number', span: 12 },
  { key: 'layout.y', label: 'Y', type: 'number', span: 12 },
];

const setters = getMaterialSetters(selectedNode.value!.type) || [];
</script>

<template>
  <div v-if="selectedNode">
    <el-collapse class="collapse-panel" model-value="node">
      <el-collapse-item title="布局属性" name="layout">
        <FormCreater :setters="layoutSetters" :form-data="selectedNode" />
      </el-collapse-item>
      <el-collapse-item title="节点属性" name="node">
        <FormCreater :setters="setters" :form-data="selectedNode" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<style scoped lang="scss">
.collapse-panel {
  --el-collapse-border-color: var(--color-border);
  --el-collapse-header-height: 48rem;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-header-text-color: var(--el-text-color-primary);
  --el-collapse-header-font-size: 13rem;
  --el-collapse-content-bg-color: transparent;
  --el-collapse-content-font-size: 13rem;
  --el-collapse-content-text-color: var(--el-text-color-primary);

  border-top: 0 solid var(--el-collapse-border-color);
  border-bottom: 0 solid var(--el-collapse-border-color);

  :deep(.el-collapse-item__content) {
    padding-bottom: 0;
  }
}
</style>
