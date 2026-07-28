import { createNode, isParsedNode, type MaterialSchema } from '@/materials';
import { defineStore } from 'pinia';

export const useEditorStore = defineStore('editor', () => {
  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  });

  const nodes = ref<MaterialSchema[]>([]);

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
