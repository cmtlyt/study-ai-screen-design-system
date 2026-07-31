<script setup lang="ts">
import type { MaterialSchema } from '@/schema/types';
import { createNode, getMaterialComponent } from '@/materials';
import { useEditorStore } from '@/stores/editor';
import { storeToRefs } from 'pinia';
import Moveable from 'vue3-moveable';
import Selecto from 'vue3-selecto';
import SketchRuler from 'vue3-sketch-ruler';
import { useCanvasRuler } from './composables/use-canvas-ruler';
import { useMoveable } from './composables/use-moveable';
import { useSelection } from './composables/use-selection';
import 'vue3-sketch-ruler/lib/style.css';
import { DATA_SOURCE_KEY } from '@/constants/provider-key';

defineOptions({
  name: 'CanvasRoot',
});

const moveableRef = useTemplateRef('moveableRef');
const stageRef = useTemplateRef('stageRef');

const editorStore = useEditorStore();
const { canvas, nodes, selectedNode, dataSource } = storeToRefs(editorStore);

provide(DATA_SOURCE_KEY, dataSource);

const { onStart, onEnd, onDrag, onResize, onDragGroup, onResizeGroup } = useMoveable({
  moveableRef,
});

const { selectedTarget, onSelect, onClear, onSelectEnd } = useSelection({ stageRef, moveableRef });

const { palette, lines, scale, canvasStyle, containerSize, onZoomChange } = useCanvasRuler({
  moveableRef,
});

function getNodeStyle(node: MaterialSchema, index: number) {
  return {
    ...node.style,
    position: 'absolute',
    left: `${node.layout.x}px`,
    top: `${node.layout.y}px`,
    width: `${node.layout.width}px`,
    height: `${node.layout.height}px`,
    zIndex: index + 1,
  };
}

function onDrop(event: DragEvent) {
  const node = createNode(JSON.parse(event.dataTransfer?.getData('schema') || '{}'));

  node.layout.x = event.offsetX - node.layout.width / 2;
  node.layout.y = event.offsetY - node.layout.height / 2;

  editorStore.addNode(node);
  editorStore.selectNode(node.id);
}

const commandMap: Record<string, typeof editorStore.copyNode> = {
  copy: editorStore.copyNode,
  remove: editorStore.removeNode,
  moveTop: editorStore.moveTop,
  moveBottom: editorStore.moveBottom,
  toggleLock: editorStore.toggleLock,
};

function onCommand(command: string) {
  if (!selectedNode.value) return;
  commandMap[command]?.(selectedNode.value);
}
</script>

<template>
  <div class="relative h-full overflow-hidden isolate">
    <Moveable
      ref="moveableRef"
      :target="selectedTarget"
      :origin="false"
      :draggable="!selectedNode?.locked"
      :resizable="!selectedNode?.locked"
      @drag="onDrag"
      @drag-start="onStart"
      @drag-end="onEnd"
      @resize="onResize"
      @resize-start="onStart"
      @resize-end="onEnd"
      @drag-group="onDragGroup"
      @drag-group-start="onStart"
      @drag-group-end="onEnd"
      @resize-group="onResizeGroup"
      @resize-group-start="onStart"
      @resize-group-end="onEnd"
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
      :canvas-width="canvas.width"
      :canvas-height="canvas.height"
      :lines="lines"
      :palette="palette"
      @zoomchange="onZoomChange"
    >
      <div
        ref="stageRef"
        class="relative flex-[0_0_auto]"
        :style="canvasStyle"
        @dragover.prevent
        @mousedown.self="onClear"
        @drop="onDrop"
      >
        <el-dropdown
          v-for="(node, index) in nodes"
          :key="node.id"
          trigger="contextmenu"
          @command="onCommand"
        >
          <component
            :is="getMaterialComponent(node.type)"
            v-bind="node.props"
            class="canvas-node"
            :style="getNodeStyle(node, index)"
            :data-node-id="node.id"
            :data-node-locked="node.locked"
            :schema="node"
            @mousedown="onSelect($event, node)"
          />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="copy">复制</el-dropdown-item>
              <el-dropdown-item command="remove">移除</el-dropdown-item>
              <el-dropdown-item command="moveTop">置顶</el-dropdown-item>
              <el-dropdown-item command="moveBottom">置底</el-dropdown-item>
              <el-dropdown-item command="toggleLock">{{
                selectedNode?.locked ? '解锁' : '锁定'
              }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </SketchRuler>
  </div>
</template>
