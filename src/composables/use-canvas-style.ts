import type { CanvasSchema } from '@/schema/types';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';

export function useCanvasStyle(canvas?: Ref<CanvasSchema>) {
  if (!canvas) {
    const editorStore = useEditorStore();
    const { canvas: storeCanvas } = storeToRefs(editorStore);
    canvas = storeCanvas;
  }

  const canvasStyle = computed(() => ({
    width: `${canvas.value.width}px`,
    height: `${canvas.value.height}px`,
    backgroundColor: canvas.value.backgroundColor,
  }));

  return canvasStyle;
}
