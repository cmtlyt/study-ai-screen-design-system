import { getDeepProp, setDeepProp } from '@/utils';

interface ChangeRecord {
  target: any;
  key: string;
  value: any;
  oldValue: any;
}

const stack = shallowReactive<ChangeRecord[]>([]);
const currentIdx = shallowRef(0);

export function useUndoRedo() {
  const canUndo = computed(() => currentIdx.value > 0);
  const canRedo = computed(() => currentIdx.value < stack.length);

  const applyChange: typeof setDeepProp = (target, key, value) => {
    const oldValue = getDeepProp(target, key);

    const record = { target, key, value, oldValue };
    stack.length = currentIdx.value;
    stack[currentIdx.value++] = record;

    setDeepProp(target, key, value);
  };

  const applyRecord = (flag: 1 | -1) => {
    const tempIdx = currentIdx.value + flag;
    const record = stack[tempIdx - (~flag ? 1 : 0)];
    currentIdx.value = Math.max(0, Math.min(stack.length, tempIdx));
    if (!record) return;
    const { target, key, value, oldValue } = record;
    setDeepProp(target, key, ~flag ? value : oldValue);
  };

  const undo = () => {
    return applyRecord(-1);
  };

  const redo = () => {
    return applyRecord(1);
  };

  return { canUndo, canRedo, undo, redo, applyChange };
}
