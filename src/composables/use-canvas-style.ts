import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';

export function useCanvasStyle() {
  const editorStore = useEditorStore();
  const { canvas } = storeToRefs(editorStore);

  const canvasStyle = computed(() => ({
    width: `${canvas.value.width}px`,
    height: `${canvas.value.height}px`,
    backgroundColor: canvas.value.backgroundColor,
  }));

  return canvasStyle;
}
