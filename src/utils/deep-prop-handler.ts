type DeepValue<T, K> = K extends `${infer F}.${infer R}`
  ? F extends keyof T
    ? DeepValue<T[F], R>
    : never
  : K extends keyof T
    ? T[K]
    : never;

export function getDeepProp<T extends Record<string, any>, K extends string>(
  target: T,
  key: K,
): DeepValue<T, K> {
  return key.split('.').reduce((prev, curr) => (prev || {})[curr], target) as DeepValue<T, K>;
}

export function setDeepProp<T extends Record<string, any>, K extends string>(
  target: T,
  key: K,
  value: [string] extends [K] ? any : DeepValue<T, K>,
) {
  const keys = key.split('.');
  const lastKey = keys.pop()!;
  const lastObj = keys.reduce((prev, curr) => prev[curr], target) as any;
  lastObj[lastKey] = value;
}
