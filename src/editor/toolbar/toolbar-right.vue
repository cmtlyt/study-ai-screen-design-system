<script setup lang="ts">
import type { MaterialSchema, PageSchema } from '@/schema/types';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import { isString, tryCall } from '@cmtlyt/lingshu-toolkit';
import { ElMessage } from 'element-plus';
import DataSourceManager from './components/data-source-manager.vue';
import { useRouter } from 'vue-router';
import { publishScreen } from '@/utils';

defineOptions({
  name: 'ToolbarRight',
});

const editorStore = useEditorStore();
const { page } = storeToRefs(editorStore);

const editorJsonVisiable = ref(false);
const pageJson = ref<PageSchema>();

function previewJson() {
  editorJsonVisiable.value = true;
  pageJson.value = page.value;
}

function onConfirmJsonChange(_: Event | null, json?: string | PageSchema) {
  if (!json && !pageJson.value) return;
  json ||= pageJson.value;

  const newPage = tryCall(
    () => (isString(json) ? JSON.parse(json) : json),
    () => {},
  );
  if (!newPage) return ElMessage.error('JSON 格式错误');
  const error = editorStore.updatePage(newPage);
  if (error) return ElMessage.error(error.message);
  ElMessage.success('更新成功');
  editorJsonVisiable.value = false;
}

function onExport() {
  const exportPage = page.value;
  const exportNodes = exportPage.nodes.map((node) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = node;
    return rest as MaterialSchema;
  });
  const json = JSON.stringify({ ...exportPage, nodes: exportNodes }, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${exportPage.name}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

const importPopoverRef = useTemplateRef('importPopoverRef');

function importPage(json: string) {
  onConfirmJsonChange(null, json);
  importPopoverRef.value?.hide();
  window.removeEventListener('paste', pasteHandler);
  ElMessage.success('导入成功');
}

function pasteHandler(event: ClipboardEvent) {
  const pasteData = event.clipboardData?.items[0];
  if (!pasteData) return;
  if (pasteData.kind === 'file' && pasteData.type === 'application/json') {
    const file = pasteData.getAsFile();
    if (!file) return;
    file.text().then(importPage);
  } else if (pasteData.kind === 'string' && pasteData.type === 'text/plain') {
    pasteData.getAsString(importPage);
  }
}

function onImport() {
  window.addEventListener('paste', pasteHandler, { once: true });
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  file.text().then(importPage);
}

const dataSourceManagerVisiable = ref(false);

function openDataSourceManager() {
  dataSourceManagerVisiable.value = true;
}

const router = useRouter();

function preivewPage() {
  router.push('/preview');
}

async function publish() {
  const id = await publishScreen(page.value);
  editorStore.updatePageId(id);
  window.open(`/screen?id=${id}`, '_blank');
}
</script>

<template>
  <div
    class="flex items-center gap-8"
    :class="[
      [
        '[&_.icon]:border',
        '[&_.icon]:rounded-[4px]',
        '[&_.icon]:border-border',
        '[&_.icon]:p-4',
        '[&_.icon]:cursor-pointer',
      ],
    ]"
  >
    <span class="icon" @click="openDataSourceManager">
      <vue-icon icon="material-symbols:database" />
    </span>
    <span class="icon" @click="preivewPage"><vue-icon icon="codicon:open-preview" /></span>
    <span class="icon" @click="previewJson"><vue-icon icon="si:json-fill" /></span>
    <span class="icon" @click="publish"><vue-icon icon="grommet-icons:deploy" /></span>
    <el-popover ref="importPopoverRef" trigger="click" placement="bottom-end" width="326">
      <template #reference>
        <span class="icon" @click="onImport"><vue-icon icon="solar:import-bold" /></span>
      </template>
      <div>
        <label
          class="w-300 h-200 f-center flex-col cursor-pointer border border-dashed border-border rounded-[4px]"
        >
          <input v-show="false" type="file" accept=".json" @change="onFileChange" />
          <vue-icon class="" icon="oui:import" width="60" />
          <span class="mt-16">点击上传文件或粘贴 JSON</span>
        </label>
      </div>
    </el-popover>
    <span class="icon" @click="onExport"><vue-icon icon="solar:export-bold" /></span>
    <el-drawer
      v-model="editorJsonVisiable"
      title="编辑 JSON"
      size="800"
      :destroy-on-close="true"
      @close="pageJson = undefined"
    >
      <monaco-editor
        v-model="pageJson"
        lang="json"
        :encoder="(value: any) => JSON.stringify(value, null, 2)"
        :decoder="JSON.parse"
      />
      <template #footer>
        <el-button @click="editorJsonVisiable = false">取消</el-button>
        <el-button type="primary" @click="onConfirmJsonChange">确认</el-button>
      </template>
    </el-drawer>

    <el-dialog v-model="dataSourceManagerVisiable" title="数据源配置" width="800" destroy-on-close>
      <DataSourceManager @close="dataSourceManagerVisiable = false" />
    </el-dialog>
  </div>
</template>
