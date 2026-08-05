<script setup lang="ts">
import { createSandbox } from '@/workers/sandbox';
import testCode from './test-code?raw';

defineOptions({
  name: 'TestPage',
});

const sandbox = createSandbox();

async function testExec() {
  const context = { a: 1, b: { num: 2 }, c: [3] };
  const result = await sandbox.exec(testCode, context, (event, ...args) => {
    if (event === 'sum') {
      return args.reduce((prev, curr) => prev + curr, 0);
    }
  });
  console.debug(result, context);
}
</script>

<template>
  <div>
    <button @click="testExec">exec</button>
  </div>
</template>
