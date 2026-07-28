<script setup lang="ts">
import { createNode, getMaterialComponent, type MaterialSchema } from '@/materials';
import { useEditorStore } from '@/stores/editor';
import { debounce } from '@/utils';
import { storeToRefs } from 'pinia';
import Moveable, {
  type OnDrag,
  type OnDragGroup,
  type OnResize,
  type OnResizeGroup,
} from 'vue3-moveable';
import Selecto from 'vue3-selecto';
import SketchRuler from 'vue3-sketch-ruler';
import 'vue3-sketch-ruler/lib/style.css';

type OnSelectEnd = Parameters<NonNullable<InstanceType<typeof Selecto>['onSelectEnd']>>[0];

defineOptions({
  name: 'CanvasRoot',
});

const moveableRef = useTemplateRef<InstanceType<typeof Moveable>>('moveableRef');
const stageRef = useTemplateRef('stageRef');
const vm = getCurrentInstance();

const editorStore = useEditorStore();

const { nodes } = storeToRefs(editorStore);

function getNodeStyle(node: MaterialSchema) {
  return {
    position: 'absolute',
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
    ...node.style,
  };
}

type SelectableElement = HTMLElement | SVGElement;
const selectedTarget = shallowRef<SelectableElement | SelectableElement[] | null>();

function onDrop(event: DragEvent) {
  const node = createNode(JSON.parse(event.dataTransfer?.getData('schema') || '{}'));

  node.layout.x = event.offsetX - node.layout.width / 2;
  node.layout.y = event.offsetY - node.layout.height / 2;

  editorStore.addNode(node);
  editorStore.selectNode(node.id);

  nextTick(() => {
    selectedTarget.value = vm?.proxy?.$el.querySelector(`[data-node-id="${node.id}"]`);
  });
}

function onSelect(event: MouseEvent, node: MaterialSchema) {
  editorStore.selectNode(node.id);
  selectedTarget.value = event.currentTarget as HTMLElement;

  nextTick(() => {
    moveableRef.value?.dragStart(event);
  });
}

function getNodeByTarget(ele: SelectableElement): MaterialSchema | null {
  if (!ele.dataset.nodeId) return null;
  return editorStore.findNode(ele.dataset.nodeId) || null;
}

function onDrag(event: OnDrag) {
  if (!event.target) return;
  const node = getNodeByTarget(event.target);
  if (!node) return;

  event.target.style.left = `${event.left}px`;
  event.target.style.top = `${event.top}px`;
  node.layout.x = event.left;
  node.layout.y = event.top;
}

function onResize(event: OnResize) {
  if (!event.target) return;
  const node = getNodeByTarget(event.target);
  if (!node) return;

  event.target.style.width = `${event.width}px`;
  event.target.style.height = `${event.height}px`;
  node.layout.width = event.width;
  node.layout.height = event.height;

  onDrag(event.drag);
}

function onClear() {
  editorStore.clearSelected();
  selectedTarget.value = null;
}

function onSelectEnd(event: OnSelectEnd) {
  const ids = event.selected.map((ele) => ele.dataset.nodeId).filter(Boolean) as string[];
  editorStore.selectNodes(ids);
  selectedTarget.value = event.selected;
}

function onDragGroup(event: OnDragGroup) {
  event.events.forEach(onDrag);
}

function onResizeGroup(event: OnResizeGroup) {
  event.events.forEach(onResize);
}

const lines = ref({ h: [], v: [] });
const scale = ref(1);
const containerSize = reactive({ width: 0, height: 0 });

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

function onZoomChange() {
  moveableRef.value?.updateRect();
}

const canvasSize = reactive({ width: 1920, height: 1080 });
const canvasStyle = computed(() => ({
  width: `${canvasSize.width}px`,
  height: `${canvasSize.height}px`,
}));
</script>

<template>
  <div class="h-full">
    <Moveable
      ref="moveableRef"
      :target="selectedTarget"
      :origin="false"
      :draggable="true"
      :resizable="true"
      @drag="onDrag"
      @resize="onResize"
      @drag-group="onDragGroup"
      @resize-group="onResizeGroup"
    />
    <Selecto
      v-if="stageRef"
      :container="stageRef"
      :drag-container="stageRef"
      :select-from-inside="false"
      toggle-continue-select="shift"
      :selectable-targets="['.canvas-node']"
      @select-end="onSelectEnd"
    />
    <SketchRuler
      v-model:scale="scale"
      :thick="20"
      :width="containerSize.width"
      :height="containerSize.height"
      :canvas-width="canvasSize.width"
      :canvas-height="canvasSize.height"
      :lines="lines"
      :palette="{
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
      }"
      @zoomchange="onZoomChange"
    >
      <div
        ref="stageRef"
        class="relative bg-white flex-[0_0_auto]"
        :style="canvasStyle"
        @dragover.prevent
        @mousedown.self="onClear"
        @drop="onDrop"
      >
        <component
          v-for="node in nodes"
          :key="node.id"
          :is="getMaterialComponent(node.type)"
          v-bind="node.props"
          class="canvas-node"
          :style="getNodeStyle(node)"
          :data-node-id="node.id"
          @mousedown="onSelect($event, node)"
        />
      </div>
    </SketchRuler>
  </div>
</template>
