import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

export interface MaterialPositionLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type MaterialLayout = MaterialPositionLayout;

export interface MaterialSchema {
  id: string;
  type: string;
  name: string;
  layout: MaterialLayout;
  style?: Partial<CSSStyleDeclaration>;
  props: Record<string, any>;
}

export interface Material {
  name: string;
  icon: string;
  cagetory: CagetoryKey;
  schema: Omit<MaterialSchema, 'id'>;
}

export interface Cagetory {
  name: string;
  icon: string;
  key: CagetoryKey;
}

export interface InstallCtx {
  register: (material: Material, component: Component) => void;
}
