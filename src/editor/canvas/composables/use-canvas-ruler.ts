import { useEditorStore } from '@/stores/editor';
import { debounce } from '@/utils';
import { storeToRefs } from 'pinia';
import type Moveable from 'vue3-moveable';

interface UseCanvasRulerOptions {
  moveableRef: ShallowRef<Moveable | null>;
}

export function useCanvasRuler(options: UseCanvasRulerOptions) {
  const { moveableRef } = options;

  const editorStore = useEditorStore();
  const { canvas } = storeToRefs(editorStore);

  const lines = ref({ h: [], v: [] });
  const scale = ref(1);
  const containerSize = reactive({ width: 0, height: 0 });
  const vm = getCurrentInstance();

  const palette = {
    bgColor: '#1f2937',
    longfgColor: '#6b7290',
    fontColor: '#9ca3af',
    fontShadowColor: '#0e8da7',
    shadowColor: 'rgba(14, 141,167, 0.14)',
    lineColor: '#22c55e',
    lineType: 'solid',
    lockLineColor: '#4b55563',
    borderColor: '#374151',
    hoverBg: '#111827',
    hoverColor: '#fff',
  };

  const canvasStyle = computed(() => ({
    width: `${canvas.value.width}px`,
    height: `${canvas.value.height}px`,
    backgroundColor: canvas.value.backgroundColor,
  }));

  const onZoomChange = () => {
    moveableRef.value?.updateRect();
  };

  onMounted(() => {
    if (!vm?.proxy?.$el) return;
    const container = vm.proxy.$el as HTMLElement;

    const patchSize = debounce((size?: { width: number; height: number }) => {
      const { width, height } = size || container.getBoundingClientRect();
      containerSize.width = width;
      containerSize.height = height;
    }, 120);

    patchSize();

    const ob = new ResizeObserver((entries) => patchSize(entries[0]?.contentRect));

    ob.observe(container);

    onUnmounted(() => {
      ob.disconnect();
    });
  });

  return {
    palette,
    lines,
    scale,
    canvasStyle,
    containerSize,
    onZoomChange,
  };
}
