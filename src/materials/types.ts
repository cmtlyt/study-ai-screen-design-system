import type { DefineSchema, MaterialPositionLayout } from '@/directive/schema/types';
import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

export type SetterType = 'input' | 'select' | 'color' | 'number' | 'switch';

export interface Setter {
  key: string;
  label: string;
  type: SetterType;
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

type ComputedSchemaKeys<S extends DefineSchema> =
  | `props.${ComputedKeys<S['props']>}`
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
