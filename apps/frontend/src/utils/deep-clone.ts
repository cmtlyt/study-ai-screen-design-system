import { isObject } from '@cmtlyt/lingshu-toolkit';

export function deepClone<T>(value: T): T {
  if (!isObject(value)) return value;
  return JSON.parse(JSON.stringify(value));
}
