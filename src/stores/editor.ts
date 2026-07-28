import type { MaterialSchema, PageSchema } from '@/directive/schema/types';
import { createNode, isParsedNode } from '@/materials';
import { defineStore } from 'pinia';

export const useEditorStore = defineStore('editor', () => {
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  });

  const page = ref<PageSchema>({
    canvas: {
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
    },
    nodes: [],
  });

  const canvas = toRef(page.value, 'canvas');

  const nodes = toRef(page.value, 'nodes');

  const selectedNodeIds = ref<string[]>([]);
  const selectedNodeId = computed(() =>
    selectedNodeIds.value.length === 1 ? selectedNodeIds.value[0] : '',
  );
  const selectedNode = computed(() => nodes.value.find((item) => item.id === selectedNodeId.value));

  const addNode = (node: MaterialSchema) => {
    nodes.value.push(isParsedNode(node) ? node : createNode(node));
  };

  const selectNode = (nodeId: string) => {
    selectedNodeIds.value = [nodeId];
  };

  const clearSelected = () => {
    selectedNodeIds.value = [];
  };

  const selectNodes = (nodeIds: string[]) => {
    selectedNodeIds.value = nodeIds;
  };

  const findNode = (nodeId: string) => {
    return nodes.value.find((item) => item.id === nodeId);
  };

  return {
    page,
    canvas,
    panelVisible,
    nodes,
    selectedNodeId,
    selectedNode,
    addNode,
    selectNode,
    clearSelected,
    selectedNodeIds,
    selectNodes,
    findNode,
  };
});
