export type ComputedKeys<T extends Record<string, any>> =
  T extends Record<infer Keys extends string, any> ? Keys : '';

export type SkipComputeType = number | string | boolean;

export type ComputedDeepKeys<T extends Record<string, any>> = ComputedKeys<{
  [
    K in keyof T as K extends string
      ? T[K] extends SkipComputeType
        ? K
        : | K
          | (any[] extends T[K]
              ? `${K}.${number}${T[K][number] extends SkipComputeType ? '' : `.${ComputedDeepKeys<T[K][number]>}`}`
              : `${K}.${ComputedDeepKeys<T[K]>}`)
      : never
  ]: any;
}>;
