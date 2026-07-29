import { defineMaterial, type InstallCtx } from '../types';
import TextMaterial from './component.vue';

const textMaterial = defineMaterial({
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
  setters: [
    {
      key: 'style.color',
      label: '颜色',
      type: 'color',
      span: 8,
    },
    {
      key: 'style.fontSize',
      label: '字体大小',
      type: 'number',
      span: 16,
    },
    {
      key: 'props.content',
      label: '内容',
      type: 'input',
    },
  ],
});

export function install(ctx: InstallCtx) {
  ctx.register(textMaterial, TextMaterial);
}
