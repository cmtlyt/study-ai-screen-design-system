import type { InstallCtx, Material } from '../types';
import TextMaterial from './component.vue';

const textMaterial: Material = {
  name: '文本',
  icon: 'icon-park-outline:text',
  cagetory: 'info',
  schema: {
    type: 'text',
    name: '文本',
    layout: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    style: {
      fontSize: '16px',
      color: '#000',
    },
    props: {
      content: '文本',
    },
  },
};

export function install(ctx: InstallCtx) {
  ctx.register(textMaterial, TextMaterial);
}
