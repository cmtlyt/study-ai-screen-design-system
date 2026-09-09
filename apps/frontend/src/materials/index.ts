import type { Component } from 'vue';
import type { Cagetory, CagetoryKey, InstallCtx, Material, Setter } from './types';
import type { MaterialSchema, DefineMaterialSchema } from '@/schema/types';

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

const materialMap = new Map<MaterialSchema['type'], { material: Material; component: Component }>();

export function getMaterialComponent(_type: MaterialSchema['type']) {
  return materialMap.get(_type)?.component;
}

export function getMaterialSetters(_type: MaterialSchema['type']) {
  return materialMap.get(_type)?.material.setters;
}

export function getMaterialEventOptions(_type: MaterialSchema['type']) {
  return materialMap.get(_type)?.material.eventOptions;
}

const register: InstallCtx['register'] = (material, component) => {
  materialMap.set(material.schema.type, { material, component });
  materials.push(material);
};

Object.values<(ctx: InstallCtx) => void>(
  import.meta.glob('./*/index.ts', { eager: true, import: 'install' }),
).forEach((install) => install({ register }));

const PARSED_NODE = Symbol('PARSED_NODE');

export function createNode(node: Partial<MaterialSchema> & DefineMaterialSchema): MaterialSchema {
  if (isParsedNode(node) && node.id) return node as MaterialSchema;
  if (!node.type) {
    throw new Error('node.type is required');
  }
  return {
    ...node,
    // @ts-expect-error PARSED_NODE is a symbol
    [PARSED_NODE]: true,
    locked: node.locked || false,
    id: node.id || crypto.randomUUID(),
  };
}

export function isParsedNode(node: DefineMaterialSchema) {
  return Boolean((node as any)[PARSED_NODE]);
}
