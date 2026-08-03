<script setup lang="ts">
import { useUndoRedo } from '@/composables/use-undo-redo';
import type { Setter, SetterType } from '@/materials';
import { getDeepProp, setDeepProp } from '@/utils';
import MonacoEditor from '../monaco-editor/index.vue';

defineOptions({
  name: 'FormCreater',
});

const props = defineProps<{
  ignoreHistory?: boolean;
  setters: Setter[];
  formData: Record<string, any>;
}>();

const componentMap: Record<SetterType, Component> = {
  number: (props) => h(ElInputNumber, { precision: 0, ...props }),
  input: ElInput,
  select: ElSelect,
  switch: ElSwitch,
  color: ElColorPicker,
  checkbox: ElCheckbox,
  radio: ElRadioGroup,
  codeEditor: MonacoEditor,
};

const { applyChange, startBatch, commitBatch } = useUndoRedo();

function onFocus() {
  if (!props.ignoreHistory) {
    startBatch();
  }
}

function onBlur() {
  if (!props.ignoreHistory) {
    commitBatch();
  }
}

function onChange(value: any, setter: Setter) {
  if (props.ignoreHistory) {
    setDeepProp(props.formData, setter.key, value);
    return;
  }
  applyChange(props.formData, setter.key, value);
}
</script>

<template>
  <div>
    <el-form label-width="5em">
      <el-row>
        <el-col v-for="setter in setters" :key="setter.key" :span="setter.span">
          <el-form-item :label="setter.label" class="mb-12!">
            <component
              :is="componentMap[setter.type]"
              v-bind="setter.props"
              :model-value="getDeepProp(formData, setter.key)"
              @focus="onFocus"
              @blur="onBlur"
              @update:model-value="onChange($event, setter)"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
