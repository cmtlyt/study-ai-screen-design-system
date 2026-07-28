import type { MaterialSchema } from '@/directive/schema/types';
import type { Component } from 'vue';

export type CagetoryKey = 'chart' | 'form' | 'info';

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
