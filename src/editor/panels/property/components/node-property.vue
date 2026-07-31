<script setup lang="ts">
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import {
  getMaterialSetters,
  type NodeInfoSetters,
  type PositionLayoutLayoutSetters,
} from '@/materials';
import FormCreater from './form-creater.vue';
import DataSource from './data-source.vue';

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

const nodeInfoSetters: NodeInfoSetters = [
  { key: 'name', label: '节点名称', type: 'input' },
  { key: 'locked', label: '锁定节点', type: 'switch' },
];

const setters = computed(() => getMaterialSetters(selectedNode.value!.type) || []);

const previewJsonDrawerVisiable = ref(false);
const jsonText = ref('');

function previewJson() {
  if (!selectedNode.value) return;
  jsonText.value = JSON.stringify(
    selectedNode.value,
    (key, value) => {
      if (key === 'id' || key === 'type') return undefined;
      return value;
    },
    2,
  );
  previewJsonDrawerVisiable.value = true;
}

function onConfirmJsonChange() {
  if (!selectedNode.value) return;
  const newNode = JSON.parse(jsonText.value);
  editorStore.updateNode(selectedNode.value.id, newNode);
  previewJsonDrawerVisiable.value = false;
}
</script>

<template>
  <div v-if="selectedNode">
    <div class="border-border border-b py-8 pb-16 font-semibold flex items-center justify-between">
      <span>当前节点: {{ selectedNode.name }}</span>
      <span class="border rounded-[4px] border-border p-4 cursor-pointer" @click="previewJson">
        <vue-icon icon="si:json-fill" />
      </span>
    </div>
    <el-tabs model-value="property" stretch>
      <el-tab-pane label="属性" name="property">
        <el-collapse class="collapse-panel" :model-value="['node-info', 'node-property']">
          <el-collapse-item title="节点信息" name="node-info">
            <FormCreater :setters="nodeInfoSetters" :form-data="selectedNode" />
          </el-collapse-item>
          <el-collapse-item title="布局属性" name="layout">
            <FormCreater :setters="layoutSetters" :form-data="selectedNode" />
          </el-collapse-item>
          <el-collapse-item title="节点属性" name="node-property">
            <FormCreater :setters="setters" :form-data="selectedNode" />
          </el-collapse-item>
        </el-collapse>
      </el-tab-pane>
      <el-tab-pane label="数据源" name="data-source">
        <DataSource />
      </el-tab-pane>
    </el-tabs>
    <el-drawer
      v-model="previewJsonDrawerVisiable"
      title="JSON 编辑"
      size="800"
      destroy-on-close
      @close="jsonText = ''"
    >
      <MonacoEditor v-model="jsonText" lang="json" />
      <template #footer>
        <el-button @click="previewJsonDrawerVisiable = false">取消</el-button>
        <el-button type="primary" @click="onConfirmJsonChange">确认</el-button>
      </template>
    </el-drawer>
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
