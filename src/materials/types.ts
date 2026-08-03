import type { DefineMaterialSchema, MaterialPositionLayoutSchema } from '@/schema/types';
import type { ComputedDeepKeys, ComputedKeys } from '@/types';
import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

export type SetterType =
  'input' | 'select' | 'color' | 'number' | 'switch' | 'checkbox' | 'radio' | 'codeEditor';

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
  schema: DefineMaterialSchema;
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

type ComputedSchemaKeys<S extends DefineMaterialSchema> =
  | `props.${ComputedDeepKeys<S['props']>}`
  | (S['style'] extends Record<string, any> ? `style.${ComputedKeys<S['style']>}` : never)
  | 'name';

export interface DefineSetter<K extends string> extends Setter {
  key: K;
}

export type PositionLayoutLayoutSetters =
  DefineSetter<`layout.${keyof MaterialPositionLayoutSchema}`>[];

export type NodeInfoSetters = DefineSetter<`name` | `locked`>[];

export function defineMaterial<
  Schema extends DefineMaterialSchema,
  Setters extends DefineSetter<ComputedSchemaKeys<Schema>>[],
>(material: Material & { schema: Schema } & { setters: Setters }): Material {
  return material;
}
