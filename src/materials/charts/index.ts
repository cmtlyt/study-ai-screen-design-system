import type { InstallCtx, Material } from '../types';

const barMaterial: Material = {
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
};

const pieMaterial: Material = {
  name: '饼图',
  icon: 'lets-icons:chart',
  cagetory: 'chart',
  schema: {
    type: 'pie',
    name: '饼图',
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
};

export function install(ctx: InstallCtx) {
  ctx.register(barMaterial);
  ctx.register(pieMaterial);
}
