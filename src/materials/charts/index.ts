import { defineMaterial, type InstallCtx } from '../types';

const barMaterial = defineMaterial({
  name: '柱状图',
  icon: 'lets-icons:chart',
  cagetory: 'chart',
  schema: {
    type: 'bar',
    name: '柱状图',
    layout: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    props: {
      option: {},
    },
  },
  setters: [],
});

export function install(ctx: InstallCtx) {
  ctx.register(barMaterial, null as any);
}
