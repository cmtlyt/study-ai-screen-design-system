import type { Component } from 'vue';
import type { Cagetory, CagetoryKey, InstallCtx, Material, Setter } from './types';
import type { MaterialSchema } from '@/directive/schema/types';

export type * from './types';

const cagetorys: Cagetory[] = [
  {
    name: '图表',
    icon: 'lets-icons:chart',
    key: 'chart',
  },
  {
    name: '表单',
    icon: 'boxicons:form',
    key: 'form',
  },
  {
    name: '信息',
    icon: 'icon-park-outline:text',
    key: 'info',
  },
];

export function getMaterialCagetorys() {
  return cagetorys.slice();
}

const materials: Material[] = [];

export function getMaterialsByCagetory(cagetory: CagetoryKey) {
  return materials.filter((item) => item.cagetory === cagetory);
}

const componentMap = new Map<MaterialSchema['type'], Component>();

export function getMaterialComponent(_type: MaterialSchema['type']) {
  return componentMap.get(_type);
}

const settersMap = new Map<MaterialSchema['type'], Setter[]>();

export function getMaterialSetters(_type: MaterialSchema['type']) {
  return settersMap.get(_type);
}

const register: InstallCtx['register'] = (material, component) => {
  componentMap.set(material.schema.type, component);
  settersMap.set(material.schema.type, material.setters);
  materials.push(material);
};

Object.values<(ctx: InstallCtx) => void>(
  import.meta.glob('./*/index.ts', { eager: true, import: 'install' }),
).forEach((install) => install({ register }));

const PARSED_NODE = Symbol('PARSED_NODE');

export function createNode(node: MaterialSchema) {
  return {
    ...node,
    [PARSED_NODE]: true,
    id: crypto.randomUUID(),
  };
}

export function isParsedNode(node: MaterialSchema) {
  return Boolean((node as any)[PARSED_NODE]);
}
