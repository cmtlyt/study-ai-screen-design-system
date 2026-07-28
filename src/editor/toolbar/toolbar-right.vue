<script setup lang="ts">
defineOptions({
  name: 'ToolbarRight',
});
</script>

<template>
  <div
    class="flex items-center gap-8"
    :class="[
      [
        '[&>span]:border',
        '[&>span]:rounded-[4px]',
        '[&>span]:border-border',
        '[&>span]:p-4',
        '[&>span]:cursor-pointer',
      ],
    ]"
  >
    <span><vue-icon icon="codicon:open-preview" /></span>
    <span><vue-icon icon="si:json-fill" /></span>
    <span><vue-icon icon="grommet-icons:deploy" /></span>
    <span><vue-icon icon="solar:import-bold" /></span>
    <span><vue-icon icon="solar:export-bold" /></span>
  </div>
</template>
