import { useUndoRedo } from '@/composables/use-undo-redo';
import type { MaterialSchema, PageSchema } from '@/schema/types';
import { createNode, isParsedNode } from '@/materials';
import { defineStore } from 'pinia';
import { z } from 'zod';

const pageSchema = z.object({
  name: z.string().min(1),
  canvas: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    backgroundColor: z.string(),
  }),
  nodes: z.array(
    z.object({
      type: z.string(),
      name: z.string(),
      layout: z.object({
        x: z.number().min(0),
        y: z.number().min(0),
        width: z.number().min(1),
        height: z.number().min(1),
      }),
      props: z.record(z.string(), z.any()),
    }),
  ),
});

export const useEditorStore = defineStore('editor', () => {
  const { applyChange, startBatch, commitBatch } = useUndoRedo();

  const panelVisible = reactive({
    material: true,
    layer: true,
    property: true,
  });

  const page = ref<PageSchema>({
    name: '未命名画布',
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

  const updateNode = (nodeId: string, newNode: MaterialSchema) => {
    const index = nodes.value.findIndex((item) => item.id === nodeId);
    if (!~index) return;
    const newNodes = nodes.value.slice();
    const oldNode = newNodes[index]!;
    newNodes[index] = createNode({ ...oldNode, ...newNode, id: oldNode.id, type: oldNode.type });
    setValue(newNodes);
  };

  const updatePage = (newPage: PageSchema) => {
    const result = pageSchema.safeParse(newPage);
    if (!result.success) return result.error;

    newPage = result.data as PageSchema;

    const oldPage = page.value;
    const nodeMap = new Map(oldPage.nodes.map((item) => [item.id, item]));

    const newNodes = newPage.nodes.map((node) => {
      const oldNode = nodeMap.get(node.id);
      nodeMap.delete(node.id);
      if (!oldNode) {
        const { id: _, ...rest } = node;
        return createNode(rest);
      }
      return createNode({ ...oldNode, ...node, id: oldNode.id, type: oldNode.type });
    });

    startBatch();
    setValue(newPage.name, page.value, 'name');
    setValue(newNodes, page.value, 'nodes');
    setValue({ ...newPage.canvas }, page.value, 'canvas');
    commitBatch();
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
    updateNode,
    updatePage,
  };
});
