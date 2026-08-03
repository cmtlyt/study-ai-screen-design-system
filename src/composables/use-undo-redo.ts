import { getDeepProp, setDeepProp } from '@/utils';

interface ChangeRecord {
  target: any;
  key: string;
  value: any;
  oldValue: any;
}

const stack: ChangeRecord[][] = Array.from({ length: 50 });
window.historyStack = stack;
const windowInfo = { start: 0, end: 0 };
const currentIdx = ref(0);

const canUndo = computed(() => currentIdx.value > windowInfo.start);
const canRedo = computed(() => currentIdx.value < windowInfo.end);

function stackAt<V extends ChangeRecord[] | undefined = undefined>(
  idx: number,
  value?: V,
): [V] extends [undefined] ? (typeof stack)[number] : undefined {
  const realIdx = idx % stack.length;

  if (value) return void (stack[realIdx] = value) as any;
  return stack[realIdx] || (null as any);
}

function patchStack(value: (typeof stack)[number]) {
  stackAt(currentIdx.value++, value);
  windowInfo.end = currentIdx.value;
  if (windowInfo.end - windowInfo.start > stack.length) ++windowInfo.start;
}

let activeBatch: Map<symbol, ChangeRecord> | null = null;
const catchKeyMap = new Map<any, Record<string, symbol>>();

function getCacheKey(target: any, key: string) {
  const keyMap = catchKeyMap.get(target) || {};
  const cacheKey = (keyMap[key] ||= Symbol());
  catchKeyMap.set(target, keyMap);

  return cacheKey;
}

function startBatch() {
  activeBatch = new Map();
}

function commitBatch() {
  if (!activeBatch?.size) return;

  patchStack(Array.from(activeBatch.values()));
  activeBatch = null;
  catchKeyMap.clear();
}

const applyChange: typeof setDeepProp = (target, key, value) => {
  const oldValue = getDeepProp(target, key);
  const record = { target, key, value, oldValue };

  if (activeBatch) {
    const cacheKey = getCacheKey(target, key);
    const cachedRecord = activeBatch.get(cacheKey) || record;
    cachedRecord.value = value;
    activeBatch.set(cacheKey, cachedRecord);
  } else {
    patchStack([record]);
  }

  setDeepProp(target, key, value);
};

function applyRecord(flag: 1 | -1) {
  const isRedo = ~flag;
  if (!(isRedo ? canRedo.value : canUndo.value)) return;

  currentIdx.value += flag;
  const records = stackAt(currentIdx.value - (isRedo ? 1 : 0));
  if (!records?.length) return void (currentIdx.value -= flag);

  records.forEach(({ target, key, value, oldValue }) => {
    setDeepProp(target, key, isRedo ? value : oldValue);
  });
}

function undo() {
  if (!canUndo.value) return;
  applyRecord(-1);
}

function redo() {
  if (!canRedo.value) return;
  applyRecord(1);
}

export function useUndoRedo() {
  return { canUndo, canRedo, undo, redo, applyChange, startBatch, commitBatch };
}
