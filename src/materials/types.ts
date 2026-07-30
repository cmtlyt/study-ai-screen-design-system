import type { DefineSchema, MaterialPositionLayout } from '@/schema/types';
import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

export type SetterType = 'input' | 'select' | 'color' | 'number' | 'switch' | 'checkbox';

export interface Setter {
  key: string;
  label: string;
  type: SetterType;
  span?: number;
  props?: Record<string, any>;
  [key: string]: any;
}

export interface Material {
  name: string;
  icon: string;
  cagetory: CagetoryKey;
  schema: DefineSchema;
  setters: Setter[];
}

export interface Cagetory {
  name: string;
  icon: string;
  key: CagetoryKey;
}

export interface InstallCtx {
  register: (material: Material, component: Component) => void;
}

type ComputedKeys<T extends Record<string, any>> =
  T extends Record<infer Keys extends string, any> ? Keys : '';

type SkipType = number | string | boolean;

type ComputedDeepKeys<T extends Record<string, any>> = ComputedKeys<{
  [
    K in keyof T as K extends string
      ? T[K] extends SkipType
        ? K
        : | K
          | (any[] extends T[K]
              ? `${K}.${number}${T[K][number] extends SkipType ? '' : `.${ComputedDeepKeys<T[K][number]>}`}`
              : `${K}.${ComputedDeepKeys<T[K]>}`)
      : never
  ]: any;
}>;

type ComputedSchemaKeys<S extends DefineSchema> =
  | `props.${ComputedDeepKeys<S['props']>}`
  | (S['style'] extends Record<string, any> ? `style.${ComputedKeys<S['style']>}` : never)
  | 'name';

export interface DefineSetter<K extends string> extends Setter {
  key: K;
}

export type PositionLayoutLayoutSetters = DefineSetter<`layout.${keyof MaterialPositionLayout}`>[];

export function defineMaterial<
  Schema extends DefineSchema,
  Setters extends DefineSetter<ComputedSchemaKeys<Schema>>[],
>(material: Material & { schema: Schema } & { setters: Setters }): Material {
  return material;
}
