import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import type { SelectableElement } from '../types';
import type Selecto from 'vue3-selecto';
import type Moveable from 'vue3-moveable';
import type { MaterialSchema } from '@/schema/types';

interface UseSelectionOptions {
  stageRef: ShallowRef<HTMLDivElement | null>;
  moveableRef: ShallowRef<Moveable | null>;
}

type OnSelectEnd = Parameters<NonNullable<InstanceType<typeof Selecto>['onSelectEnd']>>[0];

export function useSelection(options: UseSelectionOptions) {
  const { stageRef, moveableRef } = options;

  const editorStore = useEditorStore();
  const { selectedNodeIds } = storeToRefs(editorStore);

  const selectedTarget = shallowRef<SelectableElement | SelectableElement[] | null>();

  const getNodeElement = (nodeId: string) => {
    return stageRef.value?.querySelector<SelectableElement>(`[data-node-id="${nodeId}"]`) || null;
  };

  watch(
    selectedNodeIds,
    (ids) => {
      selectedTarget.value = ids.map(getNodeElement).filter(Boolean) as SelectableElement[];
    },
    { deep: true, flush: 'post' },
  );

  const onSelect = (event: MouseEvent, node: MaterialSchema) => {
    editorStore.selectNode(node.id);

    nextTick(() => {
      moveableRef.value?.dragStart(event);
    });
  };

  const onClear = () => {
    editorStore.clearSelected();
  };

  const onSelectEnd = (event: OnSelectEnd) => {
    const ids = event.selected.map((ele) => ele.dataset.nodeId).filter(Boolean) as string[];
    editorStore.selectNodes(ids);
  };

  return {
    selectedTarget,
    onSelect,
    onClear,
    onSelectEnd,
  };
}
