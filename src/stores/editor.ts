import { useUndoRedo } from '@/composables/use-undo-redo';
import type { MaterialSchema, PageSchema } from '@/schema/types';
import { createNode, isParsedNode } from '@/materials';
import { defineStore } from 'pinia';

export const useEditorStore = defineStore('editor', () => {
  const { applyChange, startBatch, commitBatch } = useUndoRedo();

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

  const setValue = <
    T extends Record<string, any> = { value: MaterialSchema[] },
    K extends keyof T = 'value',
  >(
    value: T[keyof T extends K ? 'value' : K],
    target: T = nodes as unknown as T,
    key: K = 'value' as K,
  ) => {
    const _target = target || (nodes as any);
    applyChange(_target, (key || 'value') as string, value as any);
  };

  const addNode = (node: MaterialSchema) => {
    setValue([...nodes.value, isParsedNode(node) ? node : createNode(node)]);
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

  const copyNode = (node: MaterialSchema) => {
    const newNode = createNode(JSON.parse(JSON.stringify(node)));
    newNode.layout.x += 20;
    newNode.layout.y += 20;
    addNode(newNode);
    selectNode(newNode.id);
  };

  const removeNode = (node: MaterialSchema) => {
    startBatch();
    const newNodes = nodes.value.filter((item) => item.id !== node.id);
    setValue(newNodes);
    setValue(
      selectedNodeIds.value.filter((item) => item !== node.id),
      selectedNodeIds,
    );
    commitBatch();
  };

  const move = (node: MaterialSchema, pos: number) => {
    const index = nodes.value.findIndex((item) => item.id === node.id);
    if (!~index) return;
    const newNodes = nodes.value.slice();
    newNodes.splice(pos, 0, ...newNodes.splice(index, 1));
    setValue(newNodes);
  };

  const moveTop = (node: MaterialSchema) => {
    move(node, nodes.value.length - 1);
  };

  const moveBottom = (node: MaterialSchema) => {
    move(node, 0);
  };

  const toggleLock = (node: MaterialSchema) => {
    setValue(!node.locked, node, 'locked');
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
    copyNode,
    removeNode,
    move,
    moveTop,
    moveBottom,
    toggleLock,
  };
});
