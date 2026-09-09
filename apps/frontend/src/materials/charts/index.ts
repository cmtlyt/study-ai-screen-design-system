import { type InstallCtx, type Material } from '../types';
import ChartMaterial from './component.vue';

const materials = Object.values<Material>(
  import.meta.glob('./*-chart/index.ts', { import: 'material', eager: true }),
);

export function install(ctx: InstallCtx) {
  materials.forEach((material) => {
    ctx.register(material, ChartMaterial);
  });
}
