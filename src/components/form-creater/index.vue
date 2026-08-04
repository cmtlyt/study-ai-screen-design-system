<script setup lang="ts">
import { useUndoRedo } from '@/composables/use-undo-redo';
import type { Setter, SetterParser, SetterType } from '@/materials';
import { getDeepProp, setDeepProp } from '@/utils';
import MonacoEditor from '../monaco-editor/index.vue';
import { FORM_INFO } from './constants.ts';
import type { FormInfo } from './types.ts';

defineOptions({
  name: 'FormCreater',
});

const props = withDefaults(
  defineProps<{
    ignoreHistory?: boolean;
    setters: Setter[];
    formData: Record<string, any>;
  }>(),
  { ignoreHistory: false },
);

const formInfo = reactive<FormInfo>({
  formData: props.formData,
  setters: props.setters,
  ignoreHistory: props.ignoreHistory,
});

provide(FORM_INFO, formInfo);

watch(props, (newProps) => {
  formInfo.formData = newProps.formData;
  formInfo.setters = newProps.setters;
  formInfo.ignoreHistory = newProps.ignoreHistory;
});

const componentMap: Record<SetterType, Component> = {
  number: (props) => h(ElInputNumber, { precision: 0, ...props }),
  input: ElInput,
  select: ElSelect,
  switch: ElSwitch,
  color: ElColorPicker,
  checkbox: ElCheckbox,
  radio: ElRadioGroup,
  codeEditor: MonacoEditor,
  custom: (props) => h(props.setter['x-component'] as Component, { ...props }),
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

function parser(setter: Setter, handler: keyof SetterParser, data: any) {
  return setter['x-parser']?.[handler]?.(data) || data;
}

function onChange(value: any, setter: Setter) {
  value = parser(setter, 'decoder', value);

  setter['x-onChange']?.(value, formInfo.formData);

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
        <el-col
          v-for="setter in setters"
          :key="setter.key"
          v-show="
            // 每次渲染的时候都计算一下最新的 visiable 保存起来
            setter.visiable = setter['x-visiable'] ? setter['x-visiable'](formData, setter) : true
          "
          :span="setter.span"
        >
          <!-- 补充一个 v-if 防止无效的组件渲染和对应逻辑 -->
          <el-form-item v-if="setter.visiable" :label="setter.label" class="mb-12!">
            <component
              :is="componentMap[setter.type]"
              v-bind="setter.props"
              :setter="setter"
              :model-value="parser(setter, 'encoder', getDeepProp(formData, setter.key))"
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
