import type { DefineMaterialSchema, MaterialPositionLayoutSchema } from '@/schema/types';
import type { ComputedDeepKeys, ComputedKeys } from '@/types';
import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

export type SetterType =
  | 'input'
  | 'select'
  | 'color'
  | 'number'
  | 'switch'
  | 'checkbox'
  | 'radio'
  | 'codeEditor'
  | 'custom';

export interface SetterParser<T = any> {
  encoder: (value: T) => any;
  decoder: (value: any) => T;
}

export interface Setter {
  key: string;
  label: string;
  type: SetterType;
  span?: number;
  props?: Record<string, any>;
  'x-visiable'?: (data: any, setter: Setter) => boolean;
  'x-component'?: Component;
  'x-parser'?: SetterParser;
  'x-onChange'?: (value: any, formData: any) => void;
  [key: string]: any;
}

export interface EventOption {
  label: string;
  value: string;
}

export interface Material {
  name: string;
  icon: string;
  cagetory: CagetoryKey;
  schema: DefineMaterialSchema;
  setters: Setter[];
  eventOptions: EventOption[];
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
>(
  material: Omit<Material, 'eventOptions'> & { schema: Schema } & { setters: Setters } & {
    eventOptions?: EventOption[];
  },
): Material {
  material.eventOptions ||= [];
  return material as Material;
}
