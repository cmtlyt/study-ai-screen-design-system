<script setup lang="ts">
import type { Setter, SetterType } from '@/materials';
import { getDeepProp, setDeepProp } from '@/utils';

defineOptions({
  name: 'FormCreater',
});
defineProps<{
  setters: Setter[];
  formData: Record<string, any>;
}>();

const componentMap: Record<SetterType, Component> = {
  number: (props) => h(ElInputNumber, { precision: 0, ...props }),
  input: ElInput,
  select: ElSelect,
  switch: ElSwitch,
  color: ElColorPicker,
};
</script>

<template>
  <div>
    <el-form label-width="5em">
      <el-row>
        <el-col v-for="setter in setters" :key="setter.key" :span="setter.span">
          <el-form-item :label="setter.label">
            <component
              :is="componentMap[setter.type]"
              :model-value="getDeepProp(formData, setter.key)"
              @update:model-value="(value: any) => setDeepProp(formData, setter.key, value)"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.el-form-item {
  margin-bottom: 12rem;
}
</style>
