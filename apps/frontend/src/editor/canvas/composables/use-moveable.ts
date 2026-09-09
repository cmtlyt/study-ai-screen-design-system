import { useEditorStore } from '@/stores/editor';
import type { SelectableElement } from '../types';
import type { MaterialSchema } from '@/schema/types';
import type { OnDrag, OnDragGroup, OnResize, OnResizeGroup } from 'vue3-moveable';
import { useUndoRedo } from '@/composables/use-undo-redo';
import type Moveable from 'vue3-moveable';

interface UseMoveableOptions {
  moveableRef: ShallowRef<Moveable | null>;
}

export function useMoveable(options: UseMoveableOptions) {
  const { moveableRef } = options;

  const editorStore = useEditorStore();
  const { applyChange, startBatch, commitBatch } = useUndoRedo();

  watch(
    () => editorStore.nodes.map((node) => node.layout),
    () => {
      moveableRef.value?.updateRect(undefined, true);
    },
    { flush: 'post' },
  );

  const getNodeByTarget = (ele: SelectableElement): MaterialSchema | null => {
    if (!ele.dataset.nodeId) return null;
    return editorStore.findNode(ele.dataset.nodeId) || null;
  };

  const onStart = () => {
    startBatch();
  };

  const onEnd = () => {
    commitBatch();
  };

  const onDrag = (event: OnDrag) => {
    if (!event.target) return;
    const node = getNodeByTarget(event.target);
    if (!node) return;

    event.target.style.left = `${event.left}px`;
    event.target.style.top = `${event.top}px`;

    applyChange(node, 'layout', { ...node.layout, x: event.left, y: event.top });
  };

  const onResize = (event: OnResize) => {
    if (!event.target) return;
    const node = getNodeByTarget(event.target);
    if (!node) return;

    event.target.style.width = `${event.width}px`;
    event.target.style.height = `${event.height}px`;

    applyChange(node, 'layout', { ...node.layout, width: event.width, height: event.height });

    onDrag(event.drag);
  };

  const onDragGroup = (event: OnDragGroup) => {
    event.events.forEach(onDrag);
  };

  const onResizeGroup = (event: OnResizeGroup) => {
    event.events.forEach(onResize);
  };

  return {
    onStart,
    onEnd,
    onDrag,
    onResize,
    onDragGroup,
    onResizeGroup,
  };
}
